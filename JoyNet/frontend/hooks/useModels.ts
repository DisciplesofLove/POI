import { useState, useEffect } from 'react';
import { listModels } from '../utils/web3';

interface Model {
  id: string;
  name: string;
  description: string;
  price: string;
  owner: string;
  stats: {
    totalUses: number;
    reputation: number;
  };
}

export function useModels() {
  const [models, setModels] = useState<Model[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true);
        setError(null);
        const modelList = await listModels();
        setModels(modelList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load models');
      } finally {
        setLoading(false);
      }
    }

    fetchModels();
  }, []);

  return {
    models,
    loading,
    error,
  };
}