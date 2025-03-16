function ModelCard({ model, onViewDetails }) {
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
                    <div className="flex items-center space-x-2 text-white">
                        <i className="fas fa-eye"></i>
                        <span className="text-sm">Quick View</span>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(model);
                        }}
                        className="text-white bg-primary-main hover:bg-primary-dark px-3 py-1 rounded-lg text-sm"
                    >
                        Details
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
