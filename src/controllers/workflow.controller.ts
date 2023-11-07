import { PrismaClient, Workflow } from '@prisma/client';
import { Request, Response } from 'express';
import errorHandler from "../utility/errorHandler.js";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

export const createWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
        const workflowData = req.body;
        const workflow: Workflow = await prisma.workflow.create({
            data: workflowData
        });
        res.status(201).json(workflow);
    } catch (error) {
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
        errorHandler(error, res)
    }
}

export const getAllWorkflows = async (_req: Request, res: Response): Promise<void> => {
    try {
        const workflows: Workflow[] = await prisma.workflow.findMany();
        res.status(200).json(workflows);
    } catch (error) {
        errorHandler(error, res)
    }
}

export const getWorkflowById = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const workflow: Workflow | null = await prisma.workflow.findUnique({
            where: { id }
        });

        if (!workflow) {
            res.status(404).json({error: `Workflow with id ${id} not found`});
            return;
        }

        res.status(200).json(workflow);
    } catch (error) {
        errorHandler(error, res)
    }
}

export const updateWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const workflowData = req.body;
        const workflow: Workflow | null = await prisma.workflow.update({
            where: { id },
            data: workflowData
        });

        if (!workflow) {
            res.status(404).json({error: `Workflow with id ${id} not found`});
            return;
        }

        res.status(200).json(workflow);
    } catch (error) {
        errorHandler(error, res)
    }
}

export const deleteWorkflow = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const workflow: Workflow | null = await prisma.workflow.delete({
            where: {id}
        });

        workflow ? res.status(200).json(workflow) : res.status(404).json({error: `Workflow with id ${id} not found`});
    } catch (error) {
        errorHandler(error, res)
    }
}

export const deleteAllWorkflows = async (_req: Request, res: Response): Promise<void> => {
    try {
        const workflows = await prisma.workflow.deleteMany();
        res.status(200).json(workflows);
    } catch (error) {
        errorHandler(error, res)
    }
}