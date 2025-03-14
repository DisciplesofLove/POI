import { ethers } from 'ethers';
import ModelMarketplaceABI from '../../../POI/build/contracts/ModelMarketplace.json';

class MarketplaceContract {
    constructor(provider) {
        this.provider = provider;
        this.contract = null;
        this.signer = null;
    }

    async init(contractAddress) {
        this.signer = this.provider.getSigner();
        this.contract = new ethers.Contract(
            contractAddress,
            ModelMarketplaceABI.abi,
            this.signer
        );
    }

    async registerModel(modelId, metadata, price) {
        try {
            const tx = await this.contract.registerModel(
                ethers.utils.id(modelId),
                metadata,
                ethers.utils.parseEther(price.toString())
            );
            await tx.wait();
            return true;
        } catch (error) {
            console.error('Error registering model:', error);
            throw error;
        }
    }

    async useModel(modelId, executionId) {
        try {
            const tx = await this.contract.useModel(
                ethers.utils.id(modelId),
                ethers.utils.id(executionId)
            );
            await tx.wait();
            return true;
        } catch (error) {
            console.error('Error using model:', error);
            throw error;
        }
    }

    async getModelInfo(modelId) {
        try {
            const info = await this.contract.getModelInfo(ethers.utils.id(modelId));
            return {
                owner: info.owner,
                metadata: info.metadata,
                price: ethers.utils.formatEther(info.price),
                isActive: info.isActive,
                totalUses: info.totalUses.toNumber(),
                revenue: ethers.utils.formatEther(info.revenue)
            };
        } catch (error) {
            console.error('Error getting model info:', error);
            throw error;
        }
    }
}

export default MarketplaceContract;