import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});
export const createCar = async (req, res) => {
    try {
        const { customerId, registrationNumber, vin, brand, model, modelVariant, firstRegistration, mileage, lastInspectionDate, lastInspectionResult, lastInspectionKind } = req.body;
        const newCar = {
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
        };
        const car = await prisma.car.create({
            data: newCar
        });
        res.status(201).json(car);
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
