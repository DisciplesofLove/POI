import { ethers } from 'ethers';
import { ModelMarketplace__factory } from '../types/contracts';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;

export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts[0];
  } catch (error) {
    throw new Error('Failed to connect wallet');
  }
}

export function getProvider(): ethers.providers.Web3Provider {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask');
  }
  return new ethers.providers.Web3Provider(window.ethereum);
}

export function getMarketplaceContract(
  signerOrProvider: ethers.Signer | ethers.providers.Provider
): ethers.Contract {
  if (!MARKETPLACE_ADDRESS) {
    throw new Error('Marketplace address not configured');
  }
  return ModelMarketplace__factory.connect(MARKETPLACE_ADDRESS, signerOrProvider);
}

export async function executeModel(modelId: string): Promise<void> {
  const provider = getProvider();
  const signer = provider.getSigner();
  const contract = getMarketplaceContract(signer);

  try {
    const tx = await contract.executeInference(modelId, Date.now());
    await tx.wait();
  } catch (error) {
    throw new Error('Failed to execute model');
  }
}

export async function listModels() {
  const provider = getProvider();
  const contract = getMarketplaceContract(provider);

  try {
    const registeredEvents = await contract.queryFilter(
      contract.filters.ModelRegistered()
    );

    return Promise.all(
      registeredEvents.map(async (event) => {
        const model = await contract.getModel(event.args?.modelId);
        return {
          id: event.args?.modelId,
          owner: model.owner,
          name: model.name,
          description: model.description,
          price: ethers.utils.formatEther(model.price),
          stats: {
            totalUses: model.totalUses.toNumber(),
            reputation: model.reputation.toNumber(),
          },
        };
      })
    );
  } catch (error) {
    throw new Error('Failed to list models');
  }
}