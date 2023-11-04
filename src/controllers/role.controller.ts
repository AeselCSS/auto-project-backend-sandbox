import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import errorHandler from "../utility/errorHandler.js";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

interface Role {
    id: number;
    name: string;
}

export const createRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const {name} = req.body;
        console.log(name)
        const role: Role = await prisma.role.create({
            data: {name}
        });
        res.status(201).json(role);
    } catch (error) {
        errorHandler(error, res)
    }
};

export const getAllRoles = async (_req: Request, res: Response): Promise<void> => {
    try {
        const roles: Role[] = await prisma.role.findMany();
        res.status(200).json(roles);
    } catch (error) {
        errorHandler(error, res)
    }
};

export const getRoleById = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        console.log(id)
        const role: Role | null = await prisma.role.findUnique({
            where: {id: Number(id)}
        });
        res.status(200).json(role);
    } catch (error) {
        errorHandler(error, res)
    }
};