import { ethers } from 'ethers';

const JoyTokenABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)",
    "function balanceOf(address account) public view returns (uint256)"
];

class JoyTokenContract {
    constructor(provider) {
        this.provider = provider;
        this.contract = null;
        this.signer = null;
    }

    async init(contractAddress) {
        this.signer = this.provider.getSigner();
        this.contract = new ethers.Contract(
            contractAddress,
            JoyTokenABI,
            this.signer
        );
    }

    async approveMarketplace(marketplaceAddress, amount) {
        try {
            const tx = await this.contract.approve(
                marketplaceAddress,
                ethers.utils.parseEther(amount.toString())
            );
            await tx.wait();
            return true;
        } catch (error) {
            console.error('Error approving marketplace:', error);
            throw error;
        }
    }

    async getAllowance(owner, marketplaceAddress) {
        try {
            const allowance = await this.contract.allowance(owner, marketplaceAddress);
            return ethers.utils.formatEther(allowance);
        } catch (error) {
            console.error('Error getting allowance:', error);
            throw error;
        }
    }

    async getBalance(address) {
        try {
            const balance = await this.contract.balanceOf(address);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    }
}

export default JoyTokenContract;