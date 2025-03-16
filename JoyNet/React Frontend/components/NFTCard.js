function NFTCard({ nft, onBuy }) {
    const [loading, setLoading] = React.useState(false);
    const [hovered, setHovered] = React.useState(false);
    const { error: showError } = useNotification();

    async function handleBuy() {
        try {
            setLoading(true);
            const { web3, account } = await connectWallet();
            await buyNFT(web3, account, nft.listingId, nft.price);
            onBuy();
        } catch (error) {
            showError("Failed to purchase NFT. Please try again.");
            reportError(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div 
            className="glass-effect rounded-xl overflow-hidden h-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            data-name="nft-card"
        >
            {/* NFT Image with overlay */}
            <div className="relative aspect-square overflow-hidden" data-name="nft-image">
                <img 
                    src={nft.image} 
                    alt={nft.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
                />
                
                {/* Verification badge */}
                {nft.verified && (
                    <div className="absolute top-2 left-2 bg-primary-main/80 p-1 rounded-full" title="Verified NFT">
                        <i className="fas fa-check text-white text-xs"></i>
                    </div>
                )}
                
                {/* Category badge */}
                {nft.type && (
                    <div className="absolute top-2 right-2 bg-primary-main/80 px-2 py-1 rounded-lg text-xs backdrop-blur-sm">
                        {nft.type}
                    </div>
                )}
                
                {/* Hover overlay */}
                <div 
                    className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between p-4 transition-opacity duration-300 ${
                        hovered ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <div className="flex items-center space-x-2 text-white">
                        <i className="fas fa-cubes"></i>
                        <span className="text-sm">#{nft.tokenId || 'New'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://polygonscan.com/token/${nft.contractAddress}`, '_blank');
                            }}
                            className="text-white bg-white/20 hover:bg-white/30 p-1 rounded-lg"
                            title="View on blockchain"
                        >
                            <i className="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* NFT Info */}
            <div className="p-4" data-name="nft-info">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold truncate" data-name="nft-name">{nft.name}</h3>
                    <div className="flex items-center">
                        <img 
                            src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/matic.svg" 
                            alt="MATIC" 
                            className="w-4 h-4 mr-1"
                        />
                    </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2" data-name="nft-description">
                    {nft.description}
                </p>
                
                <div className="flex justify-between items-center border-t border-white/10 pt-4" data-name="nft-footer">
                    <div className="flex items-center space-x-2" data-name="nft-creator">
                        <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden">
                            <img 
                                src={`https://avatars.dicebear.com/api/identicon/${nft.creator || 'unknown'}.svg`}
                                alt="Creator"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-xs text-gray-400">
                            {nft.creator?.length > 12 
                                ? `${nft.creator.substring(0, 6)}...${nft.creator.substring(nft.creator.length - 4)}`
                                : nft.creator || 'Unknown'}
                        </span>
                    </div>
                    
                    <div className="text-lg font-bold text-white flex items-center">
                        {Web3.utils.fromWei(nft.price, 'ether')} MATIC
                    </div>
                </div>
                
                {/* NFT blockchain info */}
                <div className="grid grid-cols-3 gap-2 mt-4 border-t border-white/10 pt-4 text-xs text-gray-400">
                    <div className="text-center">
                        <p>Network</p>
                        <p className="font-semibold text-white">Polygon</p>
                    </div>
                    <div className="text-center">
                        <p>Collection</p>
                        <p className="font-semibold text-white truncate">{nft.collection}</p>
                    </div>
                    <div className="text-center">
                        <p>Token</p>
                        <p className="font-semibold text-white">ERC-721</p>
                    </div>
                </div>
            </div>
            
            {/* Buy button */}
            <div className="p-4 pt-0">
                <button 
                    className="w-full bg-primary-main hover:bg-primary-dark py-2 rounded-lg font-medium text-center transition-colors flex items-center justify-center"
                    onClick={handleBuy}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Processing...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-shopping-cart mr-2"></i>
                            Buy Now
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
