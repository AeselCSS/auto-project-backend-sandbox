import {PrismaClient, TaskInstance, WorkflowInstance} from '@prisma/client';
import {Request, Response} from 'express';
import errorHandler from "../utility/errorHandler.js";
import {taskInstancesOnWorkflowInstance} from "./taskInstance.controller.js";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

const workflowInstanceOrder = async (workflowInstanceId: string) => {
    const workflowInstance = await prisma.workflowInstance.findUnique({
        where: { id: workflowInstanceId },
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
        throw new Error(`Workflow instance with id ${workflowInstanceId} not found`);
    }
    return workflowInstance.order;
}

export const startWorkflowInstance = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // step 1 - Check if order status is not IN_PROGRESS or COMPLETED
        const order = await workflowInstanceOrder(id);

        if (order.status === 'IN_PROGRESS' || order.status === 'COMPLETED') {
            res.status(400).json({error: `Order with id ${order.id} is already ${order.status}`});
            return;
        }

        // start transaction
        const result = await prisma.$transaction(async (prisma) => {

            // step 2 - Update workflow instance status
            const workflowInstance: WorkflowInstance = await prisma.workflowInstance.update({
                where: {id},
                data: {status}
            });

            // step 3.1.1 - If new status = IN_PROGRESS - Get all task instances for workflow instance in correct order
            if (status === 'IN_PROGRESS') {
                const orderedTaskInstances = await taskInstancesOnWorkflowInstance(id)

                // step 3.1.2 - Update first task instance to IN_PROGRESS
                const firstTaskInstance: TaskInstance = orderedTaskInstances[0];
                await prisma.taskInstance.update({
                    where: {id: firstTaskInstance.id},
                    data: {status: 'IN_PROGRESS'}
                });
                return workflowInstance;
            }

            // step 3.2 - If new status = PENDING - Send response
            if (status === 'PENDING') {
                return workflowInstance;
            }

            // Handle other statuses or provide a default return
            throw new Error('Invalid status');
        });
        // end transaction

        res.status(200).json(result);

    } catch (error) {
        errorHandler(error, res);
    }
}