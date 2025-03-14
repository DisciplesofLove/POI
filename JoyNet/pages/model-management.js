import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import MarketplaceContract from '../utils/contracts/marketplace';
import { getUserListings } from '../utils/supabase/listings';
import ModelCard from '../components/ModelCard';
import ModelDetails from '../components/ModelDetails';
import ModelRegistrationForm from '../components/ModelRegistrationForm';

export default function ModelManagement() {
    const { account, library } = useWeb3React();
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedModel, setSelectedModel] = useState(null);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);

    useEffect(() => {
        const fetchUserModels = async () => {
            if (!account) return;
            
            setLoading(true);
            try {
                const { data } = await getUserListings(account);
                if (data) {
                    // Initialize contract
                    const marketplace = new MarketplaceContract(library);
                    await marketplace.init(process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS);
                    
                    // Enhance with blockchain data
                    const modelsWithBlockchainData = await Promise.all(
                        data.map(async (model) => {
                            try {
                                const onChainInfo = await marketplace.getModelInfo(model.id);
                                return {
                                    ...model,
                                    price: onChainInfo.price,
                                    totalUses: onChainInfo.totalUses,
                                    revenue: onChainInfo.revenue,
                                    isActive: onChainInfo.isActive
                                };
                            } catch (error) {
                                console.error(`Error fetching blockchain data for model ${model.id}:`, error);
                                return model;
                            }
                        })
                    );
                    
                    setModels(modelsWithBlockchainData);
                }
            } catch (error) {
                console.error('Error fetching user models:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserModels();
    }, [account, library]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Model Management</h1>
                <button
                    onClick={() => setShowRegistrationForm(true)}
                    className="bg-primary-main text-white px-4 py-2 rounded hover:bg-primary-dark"
                >
                    Register New Model
                </button>
            </div>

            {loading ? (
                <div className="text-center">Loading...</div>
            ) : models.length === 0 ? (
                <div className="text-center text-gray-500">
                    No models found. Register your first model to get started!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {models.map(model => (
                        <div key={model.id} onClick={() => setSelectedModel(model)}>
                            <ModelCard model={model} />
                        </div>
                    ))}
                </div>
            )}

            {/* Model Details Modal */}
            {selectedModel && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">{selectedModel.name}</h2>
                            <button
                                onClick={() => setSelectedModel(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <ModelDetails model={selectedModel} />
                    </div>
                </div>
            )}

            {/* Registration Form Modal */}
            {showRegistrationForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Register New Model</h2>
                            <button
                                onClick={() => setShowRegistrationForm(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <ModelRegistrationForm />
                    </div>
                </div>
            )}
        </div>
    );
}