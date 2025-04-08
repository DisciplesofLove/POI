import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { getMarketplaceContract } from '../utils/web3';

export interface Model {
  id: string;
  name: string;
  description: string;
  price: number;
  owner: string;
  image?: string;
  category?: string;
  stats: {
    totalUses: number;
    reputation: number;
    successRate?: number;
    lastUsed?: string;
  };
}

export function useModelMarketplace() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { account, provider } = useWallet();

  const executeModel = useCallback(async (modelId: string) => {
    if (!account || !provider) {
      throw new Error('Wallet not connected');
    }
    setLoading(true);
    try {
      const contract = getMarketplaceContract(provider);
      const tx = await contract.executeModel(modelId);
      await tx.wait();
    } catch (err) {
      console.error('Execute model error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [account, provider]);

  const buyModel = useCallback(async (modelId: string, price: number) => {
    if (!account || !provider) {
      throw new Error('Wallet not connected');
    }
    setLoading(true);
    try {
      const contract = getMarketplaceContract(provider);
      const tx = await contract.buyModel(modelId, {
        value: ethers.utils.parseEther(price.toString())
      });
      await tx.wait();
    } catch (err) {
      console.error('Buy model error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [account, provider]);

  const listModel = useCallback(async (modelId: string, price: number) => {
    if (!account || !provider) {
      throw new Error('Wallet not connected');
    }
    setLoading(true);
    try {
      const contract = getMarketplaceContract(provider);
      const tx = await contract.listModelForSale(
        modelId,
        ethers.utils.parseEther(price.toString())
      );
      await tx.wait();
    } catch (err) {
      console.error('List model error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [account, provider]);

  const getModels = useCallback(async () => {
    if (!provider) {
      throw new Error('Provider not available');
    }
    try {
      const contract = getMarketplaceContract(provider);
      const models = await contract.getAllModels();
      return models;
    } catch (err) {
      console.error('Get models error:', err);
      throw err;
    }
  }, [provider]);

  return {
    loading,
    error,
    executeModel,
    buyModel,
    listModel,
    getModels
  };
}