import {Order, PrismaClient, TaskInstance, WorkflowInstance} from '@prisma/client';
import {Request, Response} from 'express';
import errorHandler from "../utility/errorHandler.js";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

export const taskInstanceOrder = async (taskInstanceId: string) => {
    const taskInstance: TaskInstance |null = await prisma.taskInstance.findUnique({
        where: { id: taskInstanceId }
    });

    if (!taskInstance) {
        throw new Error(`Task instance with id ${taskInstanceId} not found`);
    }
    // find orderId via workflowInstanceId
    const workflowInstance = await prisma.workflowInstance.findUnique({
        where: { id: taskInstance.workflowInstanceId },
        include: {
            order: {
                select: {
                    status: true,
                    id: true,
                }
            }
        }
    });

    if (!workflowInstance) {
        throw new Error(`Workflow instance with id ${taskInstance.workflowInstanceId} not found`);
    }

    return workflowInstance.order;
};

export const taskInstancesOnWorkflowInstance = async (workflowInstanceId: string) => {
    const taskInstances: TaskInstance[] = await prisma.taskInstance.findMany({
        where: { workflowInstanceId },
        include: {
            task: {
                select: {
                    name: true,
                }
            }
        }
    });

    // arrange task instances to mach the order of tasks in the workflow
    const workflowInstance = await prisma.workflowInstance.findUnique({
        where: { id: workflowInstanceId },
        include: {
            workflow: {
                select: {
                    tasks: true,
                }
            }
        }
    });

    if (!workflowInstance) {
        throw new Error(`Workflow instance with id ${workflowInstanceId} not found`);
    }

    const workflowTasks = workflowInstance.workflow.tasks;

    return workflowTasks.map(task => {
        const taskInstance = taskInstances.find(taskInstance => taskInstance.taskId === task);
        if (!taskInstance) {
            throw new Error(`Task instance for task ${task} not found`);
        }
        return taskInstance;
    });
}

const checkOrderStatus = async (taskInstanceId: string) => {
    const order = await taskInstanceOrder(taskInstanceId);
    return order.status;
};

export const isAllWorkflowTasksCompleted = async (workflowInstanceId: string): Promise<boolean> => {
    const taskInstances = await prisma.taskInstance.findMany({
        where: { workflowInstanceId }
    });

    return taskInstances.every(taskInstance => taskInstance.status === 'COMPLETED');
};

export const setWorkflowInstanceStatusCompleted = async (workflowInstanceId: string): Promise<WorkflowInstance> => {
    const workflowInstance = await prisma.workflowInstance.findUnique({
        where: { id: workflowInstanceId }
    });

    if (!workflowInstance) {
        throw new Error(`Workflow instance with id ${workflowInstanceId} not found`);
    }

    return prisma.workflowInstance.update({
        where: {id: workflowInstanceId},
        data: {status: 'COMPLETED'}
    });
}

const isAllOrderWorkflowInstancesCompleted = async (taskInstanceId: string): Promise<boolean> => {
    const order = await taskInstanceOrder(taskInstanceId)
    const orderId = order.id;
    const workflowInstances = await prisma.workflowInstance.findMany({
        where: { orderId }
    });

    return workflowInstances.every(workflowInstance => workflowInstance.status === 'COMPLETED');
}

const setOrderStatusCompleted = async (orderId: string): Promise<Order> => {
    return prisma.order.update({
        where: {id: orderId},
        data: {status: 'COMPLETED'}
    });
}

export const updateTaskInstance = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        let {status, comments} = req.body;
        if (!comments) {
            comments = null;
        }
        // Step 1 - Check Order status
        if (await checkOrderStatus(id) === 'AWAITING_CUSTOMER' || await checkOrderStatus(id) === 'COMPLETED') {
            res.status(400).json({error: `Order is ${await checkOrderStatus(id)} - cannot update task instance ${id}`});
            return;
        }
        // Step 2 - Update task instance
        const taskInstance: TaskInstance = await prisma.taskInstance.update({
            where: { id },
            data: { status, comments }
        });

        /* Step 3 - If task instance is completed:
         3.A Check if all task instances for the workflow instance are completed and update status of workflow instance
         3.B Check if all workflow instances for the order are completed and update status of order
        */
        if (taskInstance.status === 'COMPLETED') {
            const allTasksCompleted = await isAllWorkflowTasksCompleted(taskInstance.workflowInstanceId);

            if (allTasksCompleted) {
              const completedWorkflowInstance = await setWorkflowInstanceStatusCompleted(taskInstance.workflowInstanceId)

                if (completedWorkflowInstance) {
                    const allOrderWorkflowsCompleted = await isAllOrderWorkflowInstancesCompleted(taskInstance.id);

                    if (allOrderWorkflowsCompleted) {
                        const completedOrder = await setOrderStatusCompleted(completedWorkflowInstance.orderId);
                        if (completedOrder) {
                            res.status(200).json(taskInstance);
                            return;
                        }
                    }
                }
            } else {
                // If all tasks are not completed, update the next task instance on workflow instance to IN_PROGRESS

                // Find and order task instances on workflow instance
                const orderedTaskInstances = await taskInstancesOnWorkflowInstance(taskInstance.workflowInstanceId);
                // Find the next task instance that is pending
                const nextTaskInstance = orderedTaskInstances!.find(taskInstance => taskInstance.status === 'PENDING');
                // Update the next task instance to IN_PROGRESS
                await prisma.taskInstance.update({
                    where: { id: nextTaskInstance!.id },
                    data: { status: 'IN_PROGRESS' }
                });
            }
        }
        res.status(200).json(taskInstance);
    } catch (error) {
        errorHandler(error, res)
    }
}

export const getAllTaskInstancesInWorkflowInstance = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const orderedTaskInstances = await taskInstancesOnWorkflowInstance(id);

        if (!orderedTaskInstances) {
            res.status(404).json({error: `Task instances for workflow instance ${id} not found`});
            return;
        }

        res.status(200).json(orderedTaskInstances);
    } catch (error) {
        errorHandler(error, res)
    }
}