import {
    Order,
    OrderStatus,
    PrismaClient,
    Task,
    TaskInstance,
    TaskStatus,
    Workflow,
    WorkflowInstance
} from '@prisma/client';
import {Request, Response} from 'express';
import errorHandler from "../utility/errorHandler.js";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { carId, customerId, workflowIds } = req.body;
        if (!workflowIds || !Array.isArray(workflowIds)) {
            res.status(400).json({ error: 'workflowIds must be an array' });
            return;
        }

        const result = await prisma.$transaction(async (prisma) => {
            // Step 1: Create order
            const orderData: {carId: string, customerId: string, status: OrderStatus} = {
                carId,
                customerId,
                status: 'AWAITING_CUSTOMER',
            };
            const order: Order = await prisma.order.create({ data: orderData });

            // Step 2: Fetch and create workflow instances
            const workflows: Workflow[] = await prisma.workflow.findMany({
                where: { id: { in: workflowIds } },
            });

            if (workflows.length !== workflowIds.length) {
                throw new Error(`found ${workflows.length} workflows, expected ${workflowIds.length}`);
            }

            let totalTime = 0;
            const workflowInstances: WorkflowInstance[] = await Promise.all(workflows.map(async (workflow) => {
                const workflowInstance: WorkflowInstance = await prisma.workflowInstance.create({
                    data: {
                        orderId: order.id,
                        workflowId: workflow.id,
                        status: 'PENDING',
                    },
                });

                // Step 3: Fetch tasks for each workflow and calculate total time
                const tasks: Task[] = await prisma.task.findMany({
                    where: { id: { in: workflow.tasks } }
                });

                totalTime += tasks.reduce((sum, task) => sum + task.time, 0);

                // Step 4: Create task instances for the workflow instance
                const taskInstancesData = tasks.map(task => ({
                    workflowInstanceId: workflowInstance.id,
                    taskId: task.id,
                    status: 'PENDING' as TaskStatus,
                }));
                await prisma.taskInstance.createMany({ data: taskInstancesData });

                return workflowInstance;
            }));

            // Update the order with the total time of tasks
            const updatedOrder = await prisma.order.update({
                where: { id: order.id },
                data: { totalTime },
            });

            // fetch task instances for each workflow instance
            const taskInstances: TaskInstance[] = await prisma.taskInstance.findMany({
                where: { workflowInstanceId: { in: workflowInstances.map(instance => instance.id) } },
            });

            return {
                order: updatedOrder,
                workflowInstances: workflowInstances.map(instance => ({
                    ...instance,
                    tasks: taskInstances.filter(taskInstance => taskInstance.workflowInstanceId === instance.id).map(taskInstance => ({
                        id: taskInstance.id,
                        status: taskInstance.status,
                    }),
                    ),
                })
                ),
            };
        });

        res.status(201).json(result);
    } catch (error) {
        errorHandler(error, res);
    }
};


export const getAllOrders = async (_req: Request, res: Response): Promise<void> => {
    try {
        const orders: Order[] = await prisma.order.findMany();
        res.status(200).json(orders);
    } catch (error) {
        errorHandler(error, res)
    }
}

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const order: Order | null = await prisma.order.findUnique({
            where: { id },
            include: {
                WorkflowInstance: {
                    include: {
                        workflow: {
                            select: {
                                id: true,
                                name: true,
                                // description: true,
                            }
                        },
                        taskInstances: {
                            select: {
                                id: true,
                                status: true,
                                task: {
                                    select: {
                                        // id: true,
                                        name: true,
                                        // description: true,
                                        // time: true,
                                    }
                                }
                            }
                        },
                    },
                },
            }
        });

        if (!order) {
            res.status(404).json({error: `Order with id ${id} not found`});
            return;
        }

        res.status(200).json(order);
    } catch (error) {
        errorHandler(error, res)
    }
}

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        await prisma.order.delete({
            where: { id }
        });
        res.status(204).end();
    } catch (error) {
        errorHandler(error, res)
    }
}

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const {status} = req.body;
        const order: Order | null = await prisma.order.update({
            where: { id },
            data: { status }
        });

        if (!order) {
            res.status(404).json({error: `Order with id ${id} not found`});
            return;
        }

        res.status(200).json(order);
    } catch (error) {
        errorHandler(error, res)
    }
}
