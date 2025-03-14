import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import MarketplaceContract from '../utils/contracts/marketplace';
import JoyTokenContract from '../utils/contracts/joytoken';

function ModelCard({ model, onViewDetails }) {
    const { account, library } = useWeb3React();
    const [marketplaceContract, setMarketplaceContract] = useState(null);
    const [joyTokenContract, setJoyTokenContract] = useState(null);
    const [modelInfo, setModelInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const initContracts = async () => {
            if (library) {
                const marketplace = new MarketplaceContract(library);
                await marketplace.init(process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS);
                setMarketplaceContract(marketplace);

                const token = new JoyTokenContract(library);
                await token.init(process.env.NEXT_PUBLIC_TOKEN_ADDRESS);
                setJoyTokenContract(token);
                
                // Fetch model info from blockchain
                try {
                    const info = await marketplace.getModelInfo(model.id);
                    setModelInfo(info);
                } catch (error) {
                    console.error('Error fetching model info:', error);
                }
            }
        };
        
        initContracts();
    }, [library, model.id]);
    const [hovered, setHovered] = React.useState(false);
    
    return (
        <div 
            className="model-card glass-effect rounded-xl overflow-hidden h-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            data-name="nft-card"
        >
            {/* NFT Image with overlay */}
            <div className="relative aspect-square overflow-hidden" data-name="nft-image">
                <img 
                    src={model.image} 
                    alt={model.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
                />
                
                {/* Verification badge */}
                {model.verified && (
                    <div className="absolute top-2 left-2 bg-primary-main/80 p-1 rounded-full" title="Verified NFT">
                        <i className="fas fa-check text-white text-xs"></i>
                    </div>
                )}
                
                {/* Category badge */}
                {model.category && (
                    <div className="absolute top-2 right-2 bg-primary-main/80 px-2 py-1 rounded-lg text-xs backdrop-blur-sm">
                        {model.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </div>
                )}
                
                {/* Hover overlay */}
                <div 
                    className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between p-4 transition-opacity duration-300 ${
                        hovered ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <div className="flex flex-col space-y-2 text-white w-full">
                        {modelInfo && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Price:</span>
                                    <span className="text-sm font-bold">{modelInfo.price} JOY</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Uses:</span>
                                    <span className="text-sm font-bold">{modelInfo.totalUses}</span>
                                </div>
                            </>
                        )}
                        <div className="flex items-center justify-between space-x-2">
                            <button 
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!marketplaceContract || !joyTokenContract) return;
                                    
                                    setLoading(true);
                                    try {
                                        // Check and handle token approval
                                        const allowance = await joyTokenContract.getAllowance(
                                            account,
                                            process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS
                                        );
                                        
                                        if (parseFloat(allowance) < parseFloat(modelInfo.price)) {
                                            // Request approval for a large amount to avoid frequent approvals
                                            await joyTokenContract.approveMarketplace(
                                                process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS,
                                                '1000000000'
                                            );
                                        }
                                        
                                        // Use model
                                        await marketplaceContract.useModel(
                                            model.id,
                                            Date.now().toString()
                                        );
                                        
                                        alert('Model usage recorded successfully!');
                                        
                                        // Refresh model info
                                        const info = await marketplaceContract.getModelInfo(model.id);
                                        setModelInfo(info);
                                    } catch (err) {
                                        console.error('Error using model:', err);
                                        alert('Error using model. Please try again.');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="flex-1 text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg text-sm"
                                disabled={!marketplaceContract}
                            >
                                Use Model
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewDetails(model);
                                }}
                                className="flex-1 text-white bg-primary-main hover:bg-primary-dark px-3 py-1 rounded-lg text-sm"
                            >
                                Details
                            </button>
                        </div>
                    </button>
                </div>
            </div>
            
            {/* NFT Info */}
            <div className="p-4" data-name="nft-info">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold truncate" data-name="nft-name">{model.name}</h3>
                    <div className="flex items-center">
                        <img 
                            src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/matic.svg" 
                            alt="MATIC" 
                            className="w-4 h-4 mr-1"
                        />
                    </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2" data-name="nft-description">
                    {model.description}
                </p>
                
                <div className="flex justify-between items-center border-t border-white/10 pt-4" data-name="nft-footer">
                    <div className="flex items-center space-x-2" data-name="nft-creator">
                        <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden">
                            <img 
                                src={`https://avatars.dicebear.com/api/identicon/${model.author || 'unknown'}.svg`}
                                alt="Creator"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-xs text-gray-400">
                            {model.author?.length > 12 
                                ? `${model.author.substring(0, 6)}...${model.author.substring(model.author.length - 4)}`
                                : model.author || 'Unknown'}
                        </span>
                    </div>
                    
                    <div className="text-lg font-bold text-white">
                        {model.price} MATIC
                    </div>
                </div>
                
                {/* NFT Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 border-t border-white/10 pt-4">
                    <div className="text-center">
                        <p className="text-xs text-gray-400">Rating</p>
                        <p className="text-sm font-semibold flex items-center justify-center">
                            <i className="fas fa-star text-yellow-500 mr-1"></i>
                            {model.rating}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400">Owners</p>
                        <p className="text-sm font-semibold">
                            {model.owners || Math.floor(model.downloads / 10) || 0}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400">Downloads</p>
                        <p className="text-sm font-semibold">
                            {model.downloads}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Buy button */}
            <div className="p-4 pt-0">
                <button 
                    className="w-full bg-primary-main hover:bg-primary-dark py-2 rounded-lg font-medium text-center transition-colors"
                    onClick={() => onViewDetails(model)}
                >
                    View Details
                </button>
            </div>
        </div>
    );
}
