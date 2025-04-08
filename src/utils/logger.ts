import winston from 'winston';

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'permanet' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
        new winston.transports.File({ 
            filename: 'error.log', 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston.transports.File({ 
            filename: 'combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});

// Add request context middleware
export const requestLogger = (req: any, res: any, next: any) => {
    const start = Date.now();
    const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(7);

    // Log request
    logger.info({
        message: 'Incoming request',
        method: req.method,
        path: req.path,
        requestId,
        ip: req.ip,
    });

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            message: 'Request completed',
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            requestId,
        });
    });

    next();
};