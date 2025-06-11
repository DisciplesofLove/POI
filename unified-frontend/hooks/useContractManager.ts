import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { create } from 'ipfs-http-client';

// Initialize IPFS client
const ipfs = create({ url: process.env.NEXT_PUBLIC_IPFS_NODE || 'http://localhost:5001' });

interface ContractData {
  id: string;
  name: string;
  version: string;
  sourceCode: string;
  abi: any;
  deployedAddress?: string;
  isVerified: boolean;
  createdAt: number;
  lastUpdated: number;
}

export const useContractManager = (marketplaceAddress: string) => {
  const { provider, account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadToIPFS = async (content: string) => {
    const result = await ipfs.add(Buffer.from(content));
    return result.path;
  };

  const registerContract = async (contractData: Omit<ContractData, 'id' | 'createdAt' | 'lastUpdated' | 'isVerified' | 'deployedAddress'>) => {
    if (!provider || !account) throw new Error('Wallet not connected');
    setLoading(true);
    setError(null);

    try {
      const signer = provider.getSigner();
      const marketplace = new ethers.Contract(
        marketplaceAddress,
        ['function registerContract(bytes32,string,string,string,string)'],
        signer
      );

      // Upload source code and ABI to IPFS
      const sourceCodeHash = await uploadToIPFS(contractData.sourceCode);
      const abiHash = await uploadToIPFS(JSON.stringify(contractData.abi));

      // Generate unique contract ID
      const contractId = ethers.utils.id(Date.now().toString() + account);

      // Register contract
      const tx = await marketplace.registerContract(
        contractId,
        contractData.name,
        contractData.version,
        sourceCodeHash,
        abiHash
      );

      await tx.wait();
      return contractId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateContract = async (
    contractId: string,
    updates: Pick<ContractData, 'name' | 'version' | 'sourceCode' | 'abi'>
  ) => {
    if (!provider || !account) throw new Error('Wallet not connected');
    setLoading(true);
    setError(null);

    try {
      const signer = provider.getSigner();
      const marketplace = new ethers.Contract(
        marketplaceAddress,
        ['function updateContract(bytes32,string,string,string,string)'],
        signer
      );

      // Upload updated source code and ABI to IPFS
      const sourceCodeHash = await uploadToIPFS(updates.sourceCode);
      const abiHash = await uploadToIPFS(JSON.stringify(updates.abi));

      const tx = await marketplace.updateContract(
        contractId,
        updates.name,
        updates.version,
        sourceCodeHash,
        abiHash
      );

      await tx.wait();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deployContract = async (contractId: string, abi: any, bytecode: string, args: any[] = []) => {
    if (!provider || !account) throw new Error('Wallet not connected');
    setLoading(true);
    setError(null);

    try {
      const signer = provider.getSigner();
      
      // Deploy the contract
      const factory = new ethers.ContractFactory(abi, bytecode, signer);
      const contract = await factory.deploy(...args);
      await contract.deployed();

      // Update the deployed address in the marketplace
      const marketplace = new ethers.Contract(
        marketplaceAddress,
        ['function setContractAddress(bytes32,address)'],
        signer
      );

      const tx = await marketplace.setContractAddress(contractId, contract.address);
      await tx.wait();

      return contract.address;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getContractInfo = async (contractId: string): Promise<ContractData> => {
    if (!provider) throw new Error('Provider not available');
    setLoading(true);
    setError(null);

    try {
      const marketplace = new ethers.Contract(
        marketplaceAddress,
        ['function getContractInfo(bytes32) view returns (address,string,string,address,string,string,bool,uint256,uint256)'],
        provider
      );

      const [
        owner,
        name,
        version,
        deployedAddress,
        sourceCodeHash,
        abiHash,
        isVerified,
        createdAt,
        lastUpdated
      ] = await marketplace.getContractInfo(contractId);

      // Fetch source code and ABI from IPFS
      const sourceCodeResponse = await fetch(`https://ipfs.io/ipfs/${sourceCodeHash}`);
      const sourceCode = await sourceCodeResponse.text();
      
      const abiResponse = await fetch(`https://ipfs.io/ipfs/${abiHash}`);
      const abi = JSON.parse(await abiResponse.text());

      return {
        id: contractId,
        name,
        version,
        sourceCode,
        abi,
        deployedAddress: deployedAddress !== ethers.constants.AddressZero ? deployedAddress : undefined,
        isVerified,
        createdAt: createdAt.toNumber(),
        lastUpdated: lastUpdated.toNumber()
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserContracts = async (userAddress: string = account): Promise<string[]> => {
    if (!provider || !userAddress) throw new Error('Provider not available or address not provided');
    setLoading(true);
    setError(null);

    try {
      const marketplace = new ethers.Contract(
        marketplaceAddress,
        ['function getUserContracts(address) view returns (bytes32[])'],
        provider
      );

      return await marketplace.getUserContracts(userAddress);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    registerContract,
    updateContract,
    deployContract,
    getContractInfo,
    getUserContracts,
    loading,
    error
  };
};