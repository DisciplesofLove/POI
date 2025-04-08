import { ethers } from 'ethers';
import { toast } from '@chakra-ui/react';

// Contract ABIs
import ModelMarketplaceABI from '../contracts/ModelMarketplace.json';
import JoyTokenABI from '../contracts/JoyToken.json';

const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;
const JOY_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_JOY_TOKEN_ADDRESS;

declare global {
  interface Window {
    ethereum: any;
  }
}

export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
}

export function getProvider(): ethers.providers.Web3Provider {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  return new ethers.providers.Web3Provider(window.ethereum);
}

export function getMarketplaceContract(
  providerOrSigner: ethers.providers.Provider | ethers.Signer
): ethers.Contract {
  if (!MARKETPLACE_ADDRESS) {
    throw new Error('Marketplace contract address not found');
  }
  return new ethers.Contract(
    MARKETPLACE_ADDRESS,
    ModelMarketplaceABI,
    providerOrSigner
  );
}

export function getJoyTokenContract(
  providerOrSigner: ethers.providers.Provider | ethers.Signer
): ethers.Contract {
  if (!JOY_TOKEN_ADDRESS) {
    throw new Error('JOY token contract address not found');
  }
  return new ethers.Contract(
    JOY_TOKEN_ADDRESS,
    JoyTokenABI,
    providerOrSigner
  );
}

export async function executeModel(modelId: string): Promise<void> {
  const provider = getProvider();
  const signer = provider.getSigner();
  const contract = getMarketplaceContract(signer);

  try {
    const tx = await contract.executeModel(modelId);
    await tx.wait();
  } catch (error) {
    console.error('Error executing model:', error);
    throw error;
  }
}

export async function buyModel(modelId: string, price: string): Promise<void> {
  const provider = getProvider();
  const signer = provider.getSigner();
  const contract = getMarketplaceContract(signer);

  try {
    const tx = await contract.buyModel(modelId, {
      value: ethers.utils.parseEther(price),
    });
    await tx.wait();
  } catch (error) {
    console.error('Error buying model:', error);
    throw error;
  }
}

export async function listModelForSale(
  modelId: string,
  price: string
): Promise<void> {
  const provider = getProvider();
  const signer = provider.getSigner();
  const contract = getMarketplaceContract(signer);

  try {
    const priceInWei = ethers.utils.parseEther(price);
    const tx = await contract.listModelForSale(modelId, priceInWei);
    await tx.wait();
  } catch (error) {
    console.error('Error listing model:', error);
    throw error;
  }
}

export async function getJoyTokenBalance(address: string): Promise<string> {
  const provider = getProvider();
  const contract = getJoyTokenContract(provider);

  try {
    const balance = await contract.balanceOf(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error getting JOY balance:', error);
    throw error;
  }
}

export async function stakeJoyTokens(amount: string): Promise<void> {
  const provider = getProvider();
  const signer = provider.getSigner();
  const contract = getJoyTokenContract(signer);

  try {
    const amountInWei = ethers.utils.parseEther(amount);
    const tx = await contract.stake(amountInWei);
    await tx.wait();
  } catch (error) {
    console.error('Error staking JOY tokens:', error);
    throw error;
  }
}

export async function getStakedJoyTokens(address: string): Promise<string> {
  const provider = getProvider();
  const contract = getJoyTokenContract(provider);

  try {
    const stakedAmount = await contract.stakedBalance(address);
    return ethers.utils.formatEther(stakedAmount);
  } catch (error) {
    console.error('Error getting staked JOY tokens:', error);
    throw error;
  }
}

// Event listeners
export function setupWeb3EventListeners(
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged: (chainId: string) => void
): void {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', onAccountsChanged);
    window.ethereum.on('chainChanged', onChainChanged);
  }
}

export function removeWeb3EventListeners(
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged: (chainId: string) => void
): void {
  if (window.ethereum) {
    window.ethereum.removeListener('accountsChanged', onAccountsChanged);
    window.ethereum.removeListener('chainChanged', onChainChanged);
  }
}