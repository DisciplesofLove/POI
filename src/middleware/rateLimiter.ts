import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    enableReadyCheck: true,
});

export const rateLimiter = rateLimit({
    store: new RedisStore({
        client: redis,
        prefix: 'rate-limit:',
    }),
    windowMs: 15 * 60 * 1000, // 15 minute window
    max: parseInt(process.env.API_RATE_LIMIT || '100'), // limit each IP to 100 requests per windowMs
    message: {
        status: 429,
        error: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});