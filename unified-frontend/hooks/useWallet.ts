import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  connectWallet,
  getProvider,
  setupWeb3EventListeners,
  removeWeb3EventListeners,
} from '../utils/web3';

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    setAccount(accounts[0] || null);
  }, []);

  const handleChainChanged = useCallback((chainId: string) => {
    setChainId(chainId);
    // Reload the page on chain change as recommended by MetaMask
    window.location.reload();
  }, []);

  const connect = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const connectedAccount = await connectWallet();
      const web3Provider = getProvider();
      const network = await web3Provider.getNetwork();
      
      setAccount(connectedAccount);
      setProvider(web3Provider);
      setChainId(network.chainId.toString());
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setChainId(null);
  }, []);

  useEffect(() => {
    // Setup event listeners
    setupWeb3EventListeners(handleAccountsChanged, handleChainChanged);

    // Check if already connected
    connect();

    // Cleanup
    return () => {
      removeWeb3EventListeners(handleAccountsChanged, handleChainChanged);
    };
  }, []);

  return {
    account,
    provider,
    chainId,
    loading,
    error,
    connect,
    disconnect
  };
}