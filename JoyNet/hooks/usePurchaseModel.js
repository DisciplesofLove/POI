import { useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { MarketplaceContract } from '../utils/contracts/marketplace';

export function usePurchaseModel() {
    const { account, library } = useWeb3React();

    const purchaseModel = useCallback(async (modelId) => {
        if (!library || !account) {
            throw new Error('Wallet not connected');
        }

        const marketplace = new MarketplaceContract(library);
        await marketplace.init(process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS);

        const executionId = ethers.utils.id(Date.now().toString());
        const tx = await marketplace.useModel(modelId, executionId);
        await tx.wait();

        return true;
    }, [account, library]);

    return { purchaseModel };
}