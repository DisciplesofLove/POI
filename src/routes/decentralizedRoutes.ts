import { Router } from 'express';
import { 
    decentralizedRouting,
    ipfsRouter,
    peerDiscovery,
    consensusValidation 
} from '../middleware/decentralizedMiddleware';

const router = Router();

// Health check endpoint using decentralized components
router.get('/health', 
    decentralizedRouting,
    async (req, res) => {
        const health = {
            status: 'UP',
            rpcEndpoint: req.rpcEndpoint,
            timestamp: new Date().toISOString()
        };
        res.json(health);
    }
);

// Data processing endpoint with full decentralized pipeline
router.post('/process',
    decentralizedRouting,
    ipfsRouter,
    peerDiscovery,
    consensusValidation,
    async (req, res) => {
        res.json({
            status: 'success',
            ipfsHash: req.ipfsHash,
            rpcEndpoint: req.rpcEndpoint
        });
    }
);

export default router;