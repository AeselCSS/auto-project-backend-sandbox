import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import errorHandler from "../utility/errorHandler.js";

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
        const hashedPassword = await bcrypt.hash(password, 10);
        const customer: Customer = await prisma.customer.create({
            data: {firstName, lastName, role: 'CUSTOMER', address, zip, city, phone, email, password: hashedPassword}
        });
        res.status(201).json(customer);
    } catch (error) {
        errorHandler(error, res)
    }
};

export const getAllCustomers = async (_req: Request, res: Response): Promise<void> => {
    try {
        const customers: Customer[] = await prisma.customer.findMany();
        res.status(200).json(customers);
    } catch (error) {
        errorHandler(error, res)
    }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const customer: Customer | null = await prisma.customer.findUnique({
            where: {id: id}
        });
        res.status(200).json(customer);
    } catch (error) {
        errorHandler(error, res)
    }
};