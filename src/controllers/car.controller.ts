import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

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
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred.' });
        }
    }
}

