import { Response } from 'express';
export default function errorHandler(err: unknown, res: Response): void {
    console.error(err); // Log the error
    res.status(500).json({
        error: err instanceof Error ? err.message : 'An unknown error occurred.'
    });
}