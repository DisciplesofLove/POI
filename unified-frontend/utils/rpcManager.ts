import { ethers } from 'ethers';
import { getProvider } from './web3';

export class RPCManager {
    private static instance: RPCManager;
    private currentNode: string | null = null;
    private failoverAttempts: number = 0;
    private readonly maxFailoverAttempts: number = 3;

    private constructor() {}

    public static getInstance(): RPCManager {
        if (!RPCManager.instance) {
            RPCManager.instance = new RPCManager();
        }
        return RPCManager.instance;
    }

    public async getBestNode(): Promise<string> {
        const provider = getProvider();
        const signer = provider.getSigner();
        const sovereignRPC = new ethers.Contract(
            process.env.NEXT_PUBLIC_SOVEREIGN_RPC_ADDRESS!,
            SovereignRPCABI,
            signer
        );

        try {
            const [nodeAddress, endpoint] = await sovereignRPC.getBestNode();
            this.currentNode = endpoint;
            this.failoverAttempts = 0;
            return endpoint;
        } catch (error) {
            console.error('Error getting best RPC node:', error);
            return this.handleFailover();
        }
    }

    private async handleFailover(): Promise<string> {
        this.failoverAttempts++;
        if (this.failoverAttempts >= this.maxFailoverAttempts) {
            throw new Error('Max failover attempts reached');
        }
        
        // Fallback to default RPC endpoint
        return process.env.NEXT_PUBLIC_DEFAULT_RPC_URL!;
    }

    public async validateIOTAStream(streamId: string): Promise<boolean> {
        if (!IOTA_VALIDATOR_ADDRESS) {
            throw new Error('IOTA validator address not configured');
        }
        const provider = getProvider();
        const signer = provider.getSigner();
        const iotaValidator = IIOTAValidator__factory.connect(
            IOTA_VALIDATOR_ADDRESS!,
            signer
        );

        try {
            return await iotaValidator.validateStreamId(streamId);
        } catch (error) {
            console.error('Error validating IOTA stream:', error);
            return false;
        }
    }

    public async getStreamData(streamId: string): Promise<string> {
        const provider = getProvider();
        const signer = provider.getSigner();
        const iotaValidator = IIOTAValidator__factory.connect(
            IOTA_VALIDATOR_ADDRESS!,
            signer
        );

        try {
            const data = await iotaValidator.getStreamData(streamId);
            return ethers.utils.toUtf8String(data);
        } catch (error) {
            console.error('Error getting stream data:', error);
            throw error;
        }
    }
}