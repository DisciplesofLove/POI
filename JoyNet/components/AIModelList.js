import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import ModelCard from './ModelCard';
import ModelDetailModal from './ModelDetailModal';
import ModelListFilters from './ModelListFilters';
import MarketplaceContract from '../utils/contracts/marketplace';
import JoyTokenContract from '../utils/contracts/joytoken';
import { getListings } from '../utils/supabase/listings';

export default function AIModelList({ category: initialCategory }) {
    const { library } = useWeb3React();
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedModel, setSelectedModel] = useState(null);
    const [filters, setFilters] = useState({
        category: initialCategory || '',
        sortBy: 'newest',
        maxPrice: '',
        activeOnly: true
    });

    const [marketplaceContract, setMarketplaceContract] = useState(null);

    useEffect(() => {
        if (library) {
            const initContract = async () => {
                const contract = new MarketplaceContract(library);
                await contract.init(process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS);
                setMarketplaceContract(contract);
            };
            initContract();
        }
    }, [library]);

    useEffect(() => {
        const fetchModels = async () => {
            setLoading(true);
            try {
                const { data } = await getListings(filters.category);
                
                if (marketplaceContract) {
                    const enhancedData = await Promise.all(
                        data.map(async (model) => {
                            try {
                                const onChainInfo = await marketplaceContract.getModelInfo(model.id);
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

                    // Apply filters
                    let filteredModels = enhancedData.filter(model => {
                        if (filters.activeOnly && !model.isActive) return false;
                        if (filters.maxPrice && parseFloat(model.price) > parseFloat(filters.maxPrice)) return false;
                        return true;
                    });

                    // Sort models
                    filteredModels.sort((a, b) => {
                        switch (filters.sortBy) {
                            case 'price-low':
                                return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
                            case 'price-high':
                                return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
                            case 'usage':
                                return (b.totalUses || 0) - (a.totalUses || 0);
                            case 'revenue':
                                return (parseFloat(b.revenue) || 0) - (parseFloat(a.revenue) || 0);
                            default: // 'newest'
                                return new Date(b.created_at) - new Date(a.created_at);
                        }
                    });

                    setModels(filteredModels);
                } else {
                    setModels(data);
                }
            } catch (error) {
                console.error('Error fetching models:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchModels();
    }, [marketplaceContract, filters]);

    return (
        <div className="container mx-auto px-4 py-8">
            <ModelListFilters filters={filters} setFilters={setFilters} />
            
            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : models.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No models found matching your criteria.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {models.map(model => (
                        <ModelCard 
                            key={model.id} 
                            model={model}
                            onViewDetails={() => setSelectedModel(model)}
                        />
                    ))}
                </div>
            )}

            {selectedModel && (
                <ModelDetailModal
                    model={selectedModel}
                    onClose={() => setSelectedModel(null)}
                />
            )}
        </div>
    );
}