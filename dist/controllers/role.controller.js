import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});
export const createRole = async (req, res) => {
    try {
        const { name } = req.body;
        console.log(name);
        const role = await prisma.role.create({
            data: { name }
        });
        res.status(201).json(role);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unknown error occurred.' });
        }
    }
};
export const getAllRoles = async (_req, res) => {
    try {
        const roles = await prisma.role.findMany();
        res.status(200).json(roles);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unknown error occurred.' });
        }
    }
};
export const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        const role = await prisma.role.findUnique({
            where: { id: Number(id) }
        });
        res.status(200).json(role);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unknown error occurred.' });
        }
    }
};
