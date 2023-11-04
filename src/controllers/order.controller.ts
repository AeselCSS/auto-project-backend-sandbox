import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import errorHandler from "../utility/errorHandler.js";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

interface Order {
    id: number;
    statusId: number;
    carId: number;
    createdAt: Date;
    updatedAt: Date;
}

interface OrderWithStatus extends Order {
    status: {
        id: number;
        description: string;
    }
}

interface OrderWithDetails extends OrderWithStatus {
    car: {
        id: number;
        customerId: number;
    };
    OrderWorkflowTask: {
        id?: number; // if not optional, it will break the getOrderWorkflowTaskStatuses function
        orderId: number;
        taskId: number;
        workflowId: number;
        statusId: number;
        startedAt?: Date | null; // optional fields
        completedAt?: Date | null; // optional fields
        task: {
            id: number;
            name: string;
            time: number;
            description: string;
        };
        status: {
            id: number;
            description: string;
        };
        workflow: {
            id: number;
            name: string;
            description: string;
        };
    }[];
}

interface formattedOutput {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    car: {
        carId: number;
        customerId: number;
    }
    status: {
        id: number;
        description: string;
    }
    workflows: {
        id: number;
        name: string;
        description: string;
        tasks: {
            id: number;
            name: string;
            time: number;
            description: string;
            status: {
                id: number;
                description: string;
            }
        }[]
    }[]
}


export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { statusId, carId, workflowIds } = req.body;

        if (!statusId || !carId || !Array.isArray(workflowIds)) {
            res.status(400).json({ error: 'Missing or invalid required fields' });
            return;
        }

        const result = await prisma.$transaction(async (prisma) => {
            // Create a new order
            const order = await prisma.order.create({
                data: { statusId, carId },
            });

            // Create new entries in OrderWorkflow for each workflow
            await Promise.all(
                workflowIds.map((workflowId: number) =>
                    prisma.orderWorkflow.create({
                        data: { orderId: order.id, workflowId },
                    })
                )
            );

            // For each workflow, find its tasks and create entries in OrderWorkflowTask
            await Promise.all(
                workflowIds.map(async (workflowId: number) => {
                    const workflowTasks = await prisma.workflowTask.findMany({
                        where: { workflowId },
                    });

                    return Promise.all(
                        workflowTasks.map((workflowTask) =>
                            prisma.orderWorkflowTask.create({
                                data: {
                                    orderId: order.id,
                                    taskId: workflowTask.taskId,
                                    workflowId: workflowTask.workflowId,
                                    statusId: 2,
                                },
                            })
                        )
                    );
                })
            );

            // Return the newly created order
            return order;
        });

        res.status(201).json(result);
    } catch (error) {
        errorHandler(error, res)
    }
};




export const getAllOrders = async (_req: Request, res: Response): Promise<void> => {
    try {
        const orders: Order[] = await prisma.order.findMany();
        res.status(200).json(orders);
    } catch (error) {
        errorHandler(error, res)
    }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const order: Order | null = await prisma.order.findUnique({
            where: {id: Number(id)}
        });

        if (!order) {
            res.status(404).json({error: `Order with id ${id} not found`});
            return;
        }

        res.status(200).json(order);
    } catch (error) {
        errorHandler(error, res)
    }
};

export const getOrderWorkflowTaskStatuses = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const orderWithDetails = await prisma.order.findUnique({
            where: { id: Number(id) },
            include: {
                car: true,
                status: true,
                OrderWorkflowTask: {
                    include: {
                        task: true,
                        status: true,
                        workflow: true,
                    }
                }
            }
        });

        if (!orderWithDetails) {
            res.status(404).json({error: `Order with id ${id} not found`});
            return;
        }
        const result: formattedOutput = formatOutput(orderWithDetails);

            res.status(200).json(result);
    } catch (error) {
        errorHandler(error, res)
    }
};

export const updateOrderWorkflows = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { workflowIds } = req.body;

        if (!workflowIds || !Array.isArray(workflowIds)) {
            res.status(400).json({ error: 'Missing or invalid required fields' });
            return;
        }

        const order: OrderWithStatus | null = await prisma.order.findUnique({
            where: { id: Number(id) },
            include: {status: true}
        });

        if (!order) {
            res.status(404).json({ error: `Order with id ${id} not found` });
            return;
        }
        // Check if order is in progress or completed and return an error if it is
        if(order.status.description.toLowerCase() === "in progress" || order.status.description.toLowerCase() === "completed") {
            res.status(400).json({ error: 'Order is already in progress or completed' });
            return;
        }

        // Delete all the workflows for the order
        await prisma.orderWorkflow.deleteMany({
            where: { orderId: Number(id) }
        });
        // Create the new workflows for the order
        await Promise.all( // Use Promise.all to wait for all the workflows to be created
            workflowIds.map((workflowId: number) =>
                prisma.orderWorkflow.create({
                    data: { orderId: Number(id), workflowId }
                })
            )
        );

        res.status(200).json(order);
    } catch (error) {
        errorHandler(error, res)
}
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const order: Order | null = await prisma.order.delete({
            where: {id: Number(id)}
        });

        if (!order) {
            res.status(404).json({error: `Order with id ${id} not found`});
            return;
        }

        res.status(200).json(order);
    } catch (error) {
        errorHandler(error, res)
    }
};


// Helper function to format the output
function formatOutput(order: OrderWithDetails): formattedOutput {
    // Format car data
    const carData = {
        carId: order.car.id,
        customerId: order.car.customerId,
    };

    // Format status data
    const statusData = {
        id: order.status.id,
        description: order.status.description,
    };

    const tasksByWorkflow = order.OrderWorkflowTask.reduce((acc: any, task) => {
        const { workflow } = task;
        if (!acc[workflow.id]) {
            acc[workflow.id] = {
                id: workflow.id,
                name: workflow.name,
                description: workflow.description,
                tasks: [],
            };
        }

        acc[workflow.id].tasks.push({
            id: task.task.id,
            name: task.task.name,
            time: task.task.time,
            description: task.task.description,
            status: {
                id: task.status.id,
                description: task.status.description,
            },
        });

        return acc;
    }, {});

    // Convert the tasks object into an array of workflows
    const workflows: formattedOutput['workflows'] = Object.values(tasksByWorkflow) as formattedOutput['workflows'];


    // Return the formatted result
    return {
        id: order.id,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        car: carData,
        status: statusData,
        workflows,
    };
}