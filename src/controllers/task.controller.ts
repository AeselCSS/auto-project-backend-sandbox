import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import errorHandler from "../utility/errorHandler.js";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

interface Task {
    id: number;
    name: string;
    description: string;
    time: number;
}

export const createTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const {name, description, time} = req.body;
        const task: Task = await prisma.task.create({
            data: {name, description, time}
        });

        res.status(201).json(task);
    } catch (error) {
        errorHandler(error, res)
    }
};

export const createManyTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        const {tasks} = req.body;
        const createdTasks = await prisma.task.createMany({
            data: tasks
        });

        res.status(201).json(createdTasks);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred.' })
        }
    }
}

export const getAllTasks = async (_req: Request, res: Response): Promise<void> => {
    try {
        const tasks: Task[] = await prisma.task.findMany();
        res.status(200).json(tasks);
    } catch (error) {
        errorHandler(error, res)
    }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const task: Task | null = await prisma.task.findUnique({
            where: {id: Number(id)}
        });
        res.status(200).json(task);
    } catch (error) {
        errorHandler(error, res)
    }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const {name, description, time} = req.body;
        const task: Task | null = await prisma.task.update({
            where: {id: Number(id)},
            data: {name, description, time}
        });
        res.status(200).json(task);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred.' })
        }
    }
}

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const task: Task | null = await prisma.task.delete({
            where: {id: Number(id)}
        });
        res.status(200).json(task);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred.' })
        }
    }
}

export const deleteAllTasks = async (_req: Request, res: Response): Promise<void> => {
    try {
        const tasks = await prisma.task.deleteMany();
        res.status(200).json(tasks);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'An unknown error occurred.' })
        }
    }
}