import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import errorHandler from "../utility/errorHandler.js";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

interface Workflow {
    id: number;
    name: string;
    description: string;
}

export const createWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
        const {name, description} = req.body;
        const workflow: Workflow = await prisma.workflow.create({
            data: {name, description}
        });

        res.status(201).json(workflow);
    } catch (error: unknown) {
        errorHandler(error, res)
    }
}

export const createManyWorkflows = async (req: Request, res: Response): Promise<void> => {
    try {
        const {workflows} = req.body;
        const createdWorkflows = await prisma.workflow.createMany({
            data: workflows
        });

        res.status(201).json(createdWorkflows);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred.' })
        }
    }
}

export const assignTasksToWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
        const workflowId = Number(req.params.id);
        const {taskIds} = req.body;

        // Assign tasks to the workflow
        // Use Promise.all to wait for all the tasks to be created
        await Promise.all(taskIds.map((taskId: number) => {
            return prisma.workflowTask.create({
                data: { workflowId, taskId }
            });
        }));

        // Return the workflow with the tasks assigned
        const workflowWithTasks = await prisma.workflow.findUnique({
            where: { id: workflowId },
            include: {
                WorkflowTask: {
                    include: {
                        task: true,
                    },
                },
            },
        });

        res.status(201).json(workflowWithTasks);
    } catch (error: unknown) {
        errorHandler(error, res)
    }
};

export const getWorkflowTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const workflowTasks = await prisma.workflowTask.findMany({
            where: {workflowId: Number(id)},
            include: {task: true}
        });

        res.status(200).json(workflowTasks);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred.' })
        }
    }
}

export const getAllWorkflows = async (_req: Request, res: Response): Promise<void> => {
    try {
        const workflows: Workflow[] = await prisma.workflow.findMany();
        res.status(200).json(workflows);
    } catch (error: unknown) {
        errorHandler(error, res)
    }
}

export const getWorkflowById = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const workflow: Workflow | null = await prisma.workflow.findUnique({
            where: {id: Number(id)}
        });

        if (workflow) {
            res.status(200).json(workflow);
        } else {
            res.status(404).json({error: `Workflow with id ${id} not found`});
        }
    } catch (error: unknown) {
        errorHandler(error, res)
    }
}

export const updateWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const {name, description} = req.body;
        const workflow: Workflow | null = await prisma.workflow.update({
            where: {id: Number(id)},
            data: {name, description}
        });

        if (workflow) {
            res.status(200).json(workflow);
        } else {
            res.status(404).json({error: `Workflow with id ${id} not found`});
        }
    } catch (error: unknown) {
        errorHandler(error, res)
    }
}

export const deleteWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const workflow: Workflow | null = await prisma.workflow.delete({
            where: {id: Number(id)}
        });

        if (workflow) {
            res.status(200).json(workflow);
        } else {
            res.status(404).json({error: `Workflow with id ${id} not found`});
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred.' })
        }
    }
}

export const deleteAllWorkflows = async (_req: Request, res: Response): Promise<void> => {
    try {
        const workflows = await prisma.workflow.deleteMany();
        res.status(200).json(workflows);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred.' })
        }
    }
}

export const deleteTasksFromWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
        const workflowId = Number(req.params.id);
        const {taskIds} = req.body;

        // Delete tasks from the workflow
        // Use Promise.all to wait for all the tasks to be deleted
        await Promise.all(taskIds.map((taskId: number) => {
            return prisma.workflowTask.delete({
                where: { workflowId_taskId: { workflowId, taskId } },
            });
        }));

        // Return the workflow with the tasks assigned
        const workflowWithTasks = await prisma.workflow.findUnique({
            where: { id: workflowId },
            include: {
                WorkflowTask: {
                    include: {
                        task: true,
                    },
                },
            },
        });

        res.status(200).json(workflowWithTasks);
    } catch (error: unknown) {
        errorHandler(error, res)
    }
}