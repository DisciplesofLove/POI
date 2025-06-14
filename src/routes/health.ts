import { Router } from 'express';
import { MetricsReporter } from '../monitor/metrics';
import { getRedisClient } from '../utils/redis';
import { DatabaseConnection } from '../utils/database';
import { Web3Provider } from '../utils/web3';

const router = Router();
const metricsReporter = new MetricsReporter();

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    services: {
        [key: string]: {
            status: 'healthy' | 'degraded' | 'unhealthy';
            latency?: number;
            message?: string;
        };
    };
}

async function checkRedis(): Promise<any> {
    const redis = getRedisClient();
    const start = Date.now();
    try {
        await redis.ping();
        return {
            status: 'healthy',
            latency: Date.now() - start,
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            message: error.message,
        };
    }
}

async function checkDatabase(): Promise<any> {
    const db = DatabaseConnection.getInstance();
    const start = Date.now();
    try {
        await db.query('SELECT 1');
        return {
            status: 'healthy',
            latency: Date.now() - start,
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            message: error.message,
        };
    }
}

async function checkBlockchain(): Promise<any> {
    const web3 = Web3Provider.getInstance();
    const start = Date.now();
    try {
        await web3.eth.getBlockNumber();
        return {
            status: 'healthy',
            latency: Date.now() - start,
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            message: error.message,
        };
    }
}

router.get('/health', async (req, res) => {
    const [redisHealth, dbHealth, blockchainHealth] = await Promise.all([
        checkRedis(),
        checkDatabase(),
        checkBlockchain(),
    ]);

    const health: HealthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '1.0.0',
        services: {
            redis: redisHealth,
            database: dbHealth,
            blockchain: blockchainHealth,
        },
    };

    // Determine overall health status
    if (Object.values(health.services).some(service => service.status === 'unhealthy')) {
        health.status = 'unhealthy';
    } else if (Object.values(health.services).some(service => service.status === 'degraded')) {
        health.status = 'degraded';
    }

    // Report metrics
    metricsReporter.reportNodeHealth('system', {
        isHealthy: health.status === 'healthy',
        score: health.status === 'healthy' ? 1 : 0,
        responseTime: Math.max(
            redisHealth.latency || 0,
            dbHealth.latency || 0,
            blockchainHealth.latency || 0
        ),
    });

    res.status(health.status === 'unhealthy' ? 503 : 200).json(health);
});

// Detailed health check for individual components
router.get('/health/:service', async (req, res) => {
    const service = req.params.service;
    let health;

    switch (service) {
        case 'redis':
            health = await checkRedis();
            break;
        case 'database':
            health = await checkDatabase();
            break;
        case 'blockchain':
            health = await checkBlockchain();
            break;
        default:
            return res.status(404).json({ error: 'Service not found' });
    }

    res.status(health.status === 'unhealthy' ? 503 : 200).json({
        service,
        ...health,
        timestamp: new Date().toISOString(),
    });
});

export default router;