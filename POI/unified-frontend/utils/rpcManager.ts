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
        if (this.nodes.size === 0) {
            await this.discoverNodes();
        }

        // Sort nodes by score and select the best one
        const sortedNodes = Array.from(this.nodes.entries())
            .sort((a, b) => b[1].score - a[1].score);

        if (sortedNodes.length === 0) {
            throw new Error('No nodes available');
        }

        const bestNode = sortedNodes[0][1].endpoint;

        // Validate node through consensus if required
        if (this.consensusRequired) {
            const isValid = await this.validateNodeConsensus(bestNode);
            if (!isValid) {
                // Try next best node
                return this.handleFailover();
            }
        }

        return bestNode;
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