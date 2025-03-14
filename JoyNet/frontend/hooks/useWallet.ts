import { useState, useEffect, useCallback } from 'react';
import { connectWallet } from '../utils/web3';

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      const address = await connectWallet();
      setAccount(address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  }, []);

  return {
    account,
    error,
    connect,
  };
}