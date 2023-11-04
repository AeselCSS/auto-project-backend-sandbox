import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import errorHandler from "../utility/errorHandler.js";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

interface Status {
    id: number;
    description: string;
}

export const createStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { description } = req.body;

        const status: Status = await prisma.status.create({
            data: { description },
        });
        res.status(201).json(status);
    } catch (error) {
        errorHandler(error, res)
    }
};

export const getAllStatuses = async (_req: Request, res: Response): Promise<void> => {
    try {
        const statuses: Status[] = await prisma.status.findMany();
        res.status(200).json(statuses);
    } catch (error) {
        errorHandler(error, res)
    }
};

export const getStatusById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const status: Status | null = await prisma.status.findUnique({
            where: { id: Number(id) }
        });
        if (!status) {
            res.status(404).json({ error: `Status with id ${id} not found.` })
            return
        }
        res.status(200).json(status);
    } catch (error) {
        errorHandler(error, res)
    }
};
