import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SmartContractManager } from '../SmartContractManager';
import { useWallet } from '../../hooks/useWallet';
import { useContractManager } from '../../hooks/useContractManager';

// Mock the hooks
jest.mock('../../hooks/useWallet');
jest.mock('../../hooks/useContractManager');

describe('SmartContractManager', () => {
  const mockMarketplaceAddress = '0x1234567890123456789012345678901234567890';
  
  beforeEach(() => {
    // Mock useWallet hook
    (useWallet as jest.Mock).mockReturnValue({
      account: '0x1234567890123456789012345678901234567890',
      provider: {}
    });

    // Mock useContractManager hook
    (useContractManager as jest.Mock).mockReturnValue({
      registerContract: jest.fn(),
      updateContract: jest.fn(),
      deployContract: jest.fn(),
      getContractInfo: jest.fn(),
      getUserContracts: jest.fn().mockResolvedValue([]),
      loading: false,
      error: null
    });
  });

  it('renders without crashing', () => {
    render(<SmartContractManager marketplaceAddress={mockMarketplaceAddress} />);
    expect(screen.getByText('Smart Contract Manager')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useContractManager as jest.Mock).mockReturnValue({
      loading: true,
      error: null
    });

    render(<SmartContractManager marketplaceAddress={mockMarketplaceAddress} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error message when there is an error', () => {
    const errorMessage = 'Test error message';
    (useContractManager as jest.Mock).mockReturnValue({
      loading: false,
      error: errorMessage
    });

    render(<SmartContractManager marketplaceAddress={mockMarketplaceAddress} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('allows creating a new contract', async () => {
    const mockRegisterContract = jest.fn().mockResolvedValue('contract-id');
    const mockGetContractInfo = jest.fn().mockResolvedValue({
      id: 'contract-id',
      name: 'Test Contract',
      version: '1.0.0',
      sourceCode: 'pragma solidity ^0.8.0;',
      createdAt: Date.now()
    });

    (useContractManager as jest.Mock).mockReturnValue({
      registerContract: mockRegisterContract,
      getContractInfo: mockGetContractInfo,
      getUserContracts: jest.fn().mockResolvedValue([]),
      loading: false,
      error: null
    });

    render(<SmartContractManager marketplaceAddress={mockMarketplaceAddress} />);

    // Switch to create tab
    fireEvent.click(screen.getByText('Create New Contract'));

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Contract Name'), {
      target: { value: 'Test Contract' }
    });
    fireEvent.change(screen.getByLabelText('Version'), {
      target: { value: '1.0.0' }
    });
    fireEvent.change(screen.getByLabelText('Contract Code'), {
      target: { value: 'pragma solidity ^0.8.0;' }
    });

    // Submit the form
    fireEvent.click(screen.getByText('Create Contract'));

    await waitFor(() => {
      expect(mockRegisterContract).toHaveBeenCalledWith({
        name: 'Test Contract',
        version: '1.0.0',
        sourceCode: 'pragma solidity ^0.8.0;',
        abi: []
      });
    });
  });

  it('allows editing an existing contract', async () => {
    const mockContract = {
      id: 'contract-id',
      name: 'Test Contract',
      version: '1.0.0',
      sourceCode: 'pragma solidity ^0.8.0;',
      abi: [],
      createdAt: Date.now(),
      isVerified: false
    };

    const mockUpdateContract = jest.fn().mockResolvedValue(undefined);
    const mockGetContractInfo = jest.fn().mockResolvedValue(mockContract);

    (useContractManager as jest.Mock).mockReturnValue({
      updateContract: mockUpdateContract,
      getContractInfo: mockGetContractInfo,
      getUserContracts: jest.fn().mockResolvedValue([mockContract.id]),
      loading: false,
      error: null
    });

    render(<SmartContractManager marketplaceAddress={mockMarketplaceAddress} />);

    // Wait for contract to load and click edit
    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit'));
    });

    // Update the contract name
    fireEvent.change(screen.getByLabelText('Contract Name'), {
      target: { value: 'Updated Contract' }
    });

    // Submit the update
    fireEvent.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(mockUpdateContract).toHaveBeenCalledWith('contract-id', {
        name: 'Updated Contract',
        version: '1.0.0',
        sourceCode: 'pragma solidity ^0.8.0;',
        abi: []
      });
    });
  });
});