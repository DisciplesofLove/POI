import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import MarketplaceContract from '../utils/contracts/marketplace';

export default function ModelDetails({ model }) {
    const { library, account } = useWeb3React();
    const [marketplaceContract, setMarketplaceContract] = useState(null);
    const [modelInfo, setModelInfo] = useState(null);
    const [newPrice, setNewPrice] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const initContract = async () => {
            if (library) {
                try {
                    const contract = new MarketplaceContract(library);
                    await contract.init(process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS);
                    setMarketplaceContract(contract);

                    const info = await contract.getModelInfo(model.id);
                    setModelInfo(info);
                } catch (error) {
                    console.error('Error initializing contract:', error);
                }
            }
        };

        initContract();
    }, [library, model.id]);

    const handlePriceUpdate = async (e) => {
        e.preventDefault();
        if (!marketplaceContract || !newPrice) return;

        setLoading(true);
        try {
            await marketplaceContract.contract.updateModelPrice(
                ethers.utils.id(model.id),
                ethers.utils.parseEther(newPrice)
            );
            alert('Price updated successfully!');
            
            // Refresh model info
            const info = await marketplaceContract.getModelInfo(model.id);
            setModelInfo(info);
        } catch (error) {
            console.error('Error updating price:', error);
            alert('Error updating price. Please try again.');
        } finally {
            setLoading(false);
            setNewPrice('');
        }
    };

    const handleDeactivate = async () => {
        if (!marketplaceContract) return;
        
        if (!confirm('Are you sure you want to deactivate this model?')) return;
        
        setLoading(true);
        try {
            await marketplaceContract.contract.deactivateModel(ethers.utils.id(model.id));
            alert('Model deactivated successfully!');
            
            // Refresh model info
            const info = await marketplaceContract.getModelInfo(model.id);
            setModelInfo(info);
        } catch (error) {
            console.error('Error deactivating model:', error);
            alert('Error deactivating model. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!modelInfo) return null;

    const isOwner = account && modelInfo.owner.toLowerCase() === account.toLowerCase();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className="font-medium text-gray-500">Current Price</h3>
                    <p className="text-lg font-bold">{modelInfo.price} JOY</p>
                </div>
                <div>
                    <h3 className="font-medium text-gray-500">Total Uses</h3>
                    <p className="text-lg font-bold">{modelInfo.totalUses}</p>
                </div>
                <div>
                    <h3 className="font-medium text-gray-500">Total Revenue</h3>
                    <p className="text-lg font-bold">{modelInfo.revenue} JOY</p>
                </div>
                <div>
                    <h3 className="font-medium text-gray-500">Status</h3>
                    <p className={`text-lg font-bold ${modelInfo.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {modelInfo.isActive ? 'Active' : 'Inactive'}
                    </p>
                </div>
            </div>

            {isOwner && (
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-bold">Owner Controls</h3>
                    
                    <form onSubmit={handlePriceUpdate} className="flex gap-4">
                        <input
                            type="number"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            placeholder="New price in JOY"
                            className="flex-1 p-2 border rounded"
                            min="0"
                            step="0.000000000000000001"
                            required
                        />
                        <button 
                            type="submit"
                            disabled={loading || !newPrice}
                            className="bg-primary-main text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            Update Price
                        </button>
                    </form>

                    <button
                        onClick={handleDeactivate}
                        disabled={loading || !modelInfo.isActive}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        Deactivate Model
                    </button>
                </div>
            )}
        </div>
    );
}