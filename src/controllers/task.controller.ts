import { PrismaClient, Task } from '@prisma/client';
import { Request, Response } from 'express';
import errorHandler from "../utility/errorHandler.js";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

export const createTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
            ...req.body
        };
        const task: Task = await prisma.task.create({
            data: taskData
        });
        res.status(201).json(task);
    } catch (error) {
        errorHandler(error, res)
    }
}

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
}

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const task: Task | null = await prisma.task.findUnique({
            where: { id }
        });

        if (!task) {
            res.status(404).json({error: `Task with id ${id} not found`});
            return;
        }

        res.status(200).json(task);
    } catch (error) {
        errorHandler(error, res)
    }
}

export const updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const {name, description, time} = req.body;
        if (!name || !description || !time) {
            res.status(400).json({error: 'Missing name, description or time'});
            return;
        }
        const task: Task | null = await prisma.task.update({
            where: {id},
            data: {name, description, time}
        });

        task ? res.status(200).json(task) : res.status(404).json({error: `Task with id ${id} not found`});

    } catch (error) {
        errorHandler(error, res)
    }
}

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const task: Task | null = await prisma.task.delete({
            where: {id}
        });

        task ? res.status(200).json(task) : res.status(404).json({error: `Task with id ${id} not found`});
    } catch (error) {
        errorHandler(error, res)
    }
}

export const deleteAllTasks = async (_req: Request, res: Response): Promise<void> => {
    try {
        const tasks = await prisma.task.deleteMany();
        res.status(200).json(tasks);
    } catch (error) {
        errorHandler(error, res)
    }
}