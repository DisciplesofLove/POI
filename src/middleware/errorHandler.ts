import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
    statusCode?: number;
    code?: string;
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error({
        message: err.message,
        code: err.code,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    // Handle specific error types
    if (err.code === 'NETWORK_ERROR') {
        return res.status(503).json({
            status: 'error',
            message: 'Service temporarily unavailable',
        });
    }

    if (err.code === 'CONTRACT_ERROR') {
        return res.status(400).json({
            status: 'error',
            message: 'Smart contract interaction failed',
        });
    }

    // Default error response
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Internal server error' : err.message;

    res.status(statusCode).json({
        status: 'error',
        message,
    });
};