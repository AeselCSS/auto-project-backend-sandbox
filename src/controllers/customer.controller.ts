import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

interface Customer {
    firstName: string;
    lastName: string;
    address: string;
    zip: number;
    city: string;
    phone: number;
    email: string;
    password: string;
}

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const {firstName, lastName, address, zip, city, phone, email, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 20);
        const customer: Customer = await prisma.customer.create({
            data: {firstName, lastName, roleId: 2, address, zip, city, phone, email, password: hashedPassword}
        });
        res.status(201).json(customer);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred.' });
        }
    }
}

export const getAllCustomers = async (_req: Request, res: Response): Promise<void> => {
    try {
        const customers: Customer[] = await prisma.customer.findMany();
        res.status(200).json(customers);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred.' });
        }
    }
}

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const customer: Customer | null = await prisma.customer.findUnique({
            where: {id: Number(id)}
        });
        res.status(200).json(customer);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred.' });
        }
    }
}