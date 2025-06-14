import express from 'express';
import { P2PService } from './services/p2pService';
import { IPFSStorage } from './utils/ipfs_utils';
import decentralizedRoutes from './routes/decentralizedRoutes';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { 
    decentralizedRouting,
    ipfsRouter,
    peerDiscovery,
    consensusValidation 
} from './middleware/decentralizedMiddleware';

class DecentralizedApp {
    private app: express.Application;
    private p2pService: P2PService;
    private ipfsStorage: IPFSStorage;

    constructor() {
        this.app = express();
        this.p2pService = P2PService.getInstance();
        this.ipfsStorage = new IPFSStorage();
        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(rateLimiter);
        
        // Global decentralized middleware
        this.app.use(decentralizedRouting);
        this.app.use(ipfsRouter);
        this.app.use(peerDiscovery);
        this.app.use(consensusValidation);
    }

    private setupRoutes() {
        this.app.use('/api', decentralizedRoutes);
        
        // Error handling
        this.app.use(errorHandler);
    }

    public async start() {
        try {
            // Initialize P2P network
            await this.p2pService.initLibp2p();
            
            // Start express server
            const port = process.env.PORT || 3000;
            this.app.listen(port, () => {
                console.log(`Decentralized server running on port ${port}`);
            });
        } catch (error) {
            console.error('Failed to start decentralized app:', error);
            process.exit(1);
        }
    }
}

// Start the application
const app = new DecentralizedApp();
app.start().catch(console.error);