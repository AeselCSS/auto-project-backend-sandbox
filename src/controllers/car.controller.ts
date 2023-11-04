import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import errorHandler from "../utility/errorHandler.js";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

interface Car {
    customerId: number;
    registrationNumber: string;
    vin: string;
    brand: string;
    model: string;
    modelVariant: string;
    firstRegistration: Date;
    mileage: number;
    lastInspectionDate: Date;
    lastInspectionResult: string;
    lastInspectionKind: string;
}

export const createCar = async (req: Request, res: Response): Promise<void> => {
    try {
        const {customerId, registrationNumber, vin, brand, model, modelVariant, firstRegistration, mileage, lastInspectionDate, lastInspectionResult, lastInspectionKind} = req.body;
        const newCar: Car = {
            customerId,
            registrationNumber,
            vin,
            brand,
            model,
            modelVariant,
            firstRegistration: new Date(firstRegistration),
            mileage,
            lastInspectionDate: new Date(lastInspectionDate),
            lastInspectionResult,
            lastInspectionKind
        }
        const car: Car = await prisma.car.create({
            data: newCar
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
        const id: number = Number(req.params.id);
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