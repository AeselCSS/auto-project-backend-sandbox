import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});
export const createCustomer = async (req, res) => {
    try {
        const { firstName, lastName, address, zip, city, phone, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 20);
        const customer = await prisma.customer.create({
            data: { firstName, lastName, roleId: 2, address, zip, city, phone, email, password: hashedPassword }
        });
        res.status(201).json(customer);
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
export const getAllCustomers = async (_req, res) => {
    try {
        const customers = await prisma.customer.findMany();
        res.status(200).json(customers);
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
