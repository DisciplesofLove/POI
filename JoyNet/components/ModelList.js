import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import ModelCard from './ModelCard';
import ModelDetailModal from './ModelDetailModal';
import ModelListFilters from './ModelListFilters';
import MarketplaceContract from '../utils/contracts/marketplace';

function ModelList({ models: initialModels }) {
    const { library } = useWeb3React();
    const [models, setModels] = useState(initialModels);
    const [selectedModel, setSelectedModel] = useState(null);
    const [filters, setFilters] = useState({
        sortBy: 'newest',
        maxPrice: '',
        activeOnly: true
    });
    const [loading, setLoading] = useState(false);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4" data-name="model-list">
            {models.map(model => (
                <ModelCard 
                    key={model.id} 
                    model={model} 
                    onViewDetails={() => setSelectedModel(model)}
                />
            ))}
            
            {selectedModel && (
                <ModelDetailModal 
                    model={selectedModel}
                    onClose={() => setSelectedModel(null)}
                />
            )}
        </div>
    );
}
