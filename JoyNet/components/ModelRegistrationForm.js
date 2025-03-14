import { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import MarketplaceContract from '../utils/contracts/marketplace';
import { createListing } from '../utils/supabase/listings';

export default function ModelRegistrationForm() {
    const { account, library } = useWeb3React();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        category: '',
        price: '',
        metadata: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Initialize marketplace contract
            const marketplace = new MarketplaceContract(library);
            await marketplace.init(process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS);

            // Create unique model ID
            const modelId = ethers.utils.id(Date.now().toString() + account);

            // Register on blockchain
            await marketplace.registerModel(
                modelId,
                formData.metadata,
                formData.price
            );

            // Create Supabase listing
            await createListing({
                id: modelId,
                name: formData.name,
                description: formData.description,
                image: formData.image,
                category: formData.category,
                price: formData.price,
                metadata: formData.metadata,
                owner: account,
                status: 'active'
            });

            alert('Model registered successfully!');
            setFormData({
                name: '',
                description: '',
                image: '',
                category: '',
                price: '',
                metadata: ''
            });
        } catch (error) {
            console.error('Error registering model:', error);
            alert('Error registering model. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Register New Model</h2>
            
            <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows="4"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                >
                    <option value="">Select category</option>
                    <option value="image">Image</option>
                    <option value="text">Text</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Price (JOY)</label>
                <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-2 border rounded"
                    min="0"
                    step="0.000000000000000001"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">IPFS Metadata Hash</label>
                <input
                    type="text"
                    value={formData.metadata}
                    onChange={(e) => setFormData({...formData, metadata: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-main hover:bg-primary-dark text-white py-2 px-4 rounded disabled:opacity-50"
            >
                {loading ? 'Registering...' : 'Register Model'}
            </button>
        </form>
    );
}