import { PrismaClient, Car} from '@prisma/client';
import { Request, Response } from 'express';
import errorHandler from "../utility/errorHandler.js";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

export const createCar = async (req: Request, res: Response): Promise<void> => {
    try {
        const carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt' | 'orders'> = {
            ...req.body,
            customerId: req.body.customerId.toString(), // Convert customerId to string
            firstRegistration: new Date(req.body.firstRegistration),
            lastInspectionDate: new Date(req.body.lastInspectionDate),
        };
        const car: Car = await prisma.car.create({
            data: carData
        });
        res.status(201).json(car);
    } catch (error) {
        errorHandler(error, res)
    }
};

export const getAllCars = async (_req: Request, res: Response): Promise<void> => {
    try {
        const cars: Car[] = await prisma.car.findMany();
        res.status(200).json(cars);
    } catch (error) {
        errorHandler(error, res)
    }
};

export const getCarById = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const car: Car | null = await prisma.car.findUnique({
            where: { id }
        });

        if (!car) {
            res.status(404).json({error: `Car with id ${id} not found`});
            return;
        }

        res.status(200).json(car);
    } catch (error) {
        errorHandler(error, res)
    }
};