import { useCallback } from 'react';
import { executeModel } from '../utils/web3';

export function useModelMarketplace() {
  const execute = useCallback(async (modelId: string) => {
    try {
      await executeModel(modelId);
    } catch (error) {
      throw new Error('Failed to execute model');
    }
  }, []);

  return {
    executeModel: execute,
  };
}