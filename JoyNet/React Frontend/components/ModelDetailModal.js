function ModelDetailModal({ model, onClose }) {
    const [loading, setLoading] = React.useState(false);
    const [tab, setTab] = React.useState('details'); // details, properties, history
    const { success, error: showError } = useNotification();
    const { currentUser } = useAuth();

    async function handlePurchase() {
        try {
            setLoading(true);
            
            if (!currentUser) {
                showError('Please connect your wallet to purchase this NFT');
                return;
            }
            
            // In a real app, this would call the purchase API
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Simulate blockchain transaction
            const txHash = "0x" + Math.random().toString(16).substring(2, 62);
            
            success(`Purchase successful! Transaction: ${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`);
            onClose();
        } catch (error) {
            console.error('Purchase failed:', error);
            reportError(error);
            showError('Failed to complete purchase');
        } finally {
            setLoading(false);
        }
    }

    // Format blockchain timestamp
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    // History transactions
    const transactions = [
        { 
            type: 'Mint', 
            from: '0x0000...0000', 
            to: model.author || '0x742d...f44e', 
            price: model.price * 0.8, 
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
            type: 'Transfer', 
            from: model.author || '0x742d...f44e', 
            to: '0x1a2b...c3d4', 
            price: model.price * 0.9, 
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
            type: 'List', 
            from: '0x1a2b...c3d4', 
            to: null, 
            price: model.price, 
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() 
        }
    ];

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-effect rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">{model.name}</h2>
                            <div className="flex items-center text-sm text-gray-400 mt-1">
                                <span className="mr-2">Token ID: #{model.tokenId || '1234'}</span>
                                <span className="mr-2">•</span>
                                <span>Owned by {model.author}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="aspect-square rounded-lg overflow-hidden">
                                <img 
                                    src={model.image}
                                    alt={model.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            
                            {/* Tab Navigation */}
                            <div className="border-b border-white/10">
                                <div className="flex space-x-6">
                                    <button 
                                        className={`pb-3 px-1 ${tab === 'details' ? 'text-primary-light border-b-2 border-primary-light' : 'text-gray-400 hover:text-white'}`}
                                        onClick={() => setTab('details')}
                                    >
                                        Details
                                    </button>
                                    <button 
                                        className={`pb-3 px-1 ${tab === 'properties' ? 'text-primary-light border-b-2 border-primary-light' : 'text-gray-400 hover:text-white'}`}
                                        onClick={() => setTab('properties')}
                                    >
                                        Properties
                                    </button>
                                    <button 
                                        className={`pb-3 px-1 ${tab === 'history' ? 'text-primary-light border-b-2 border-primary-light' : 'text-gray-400 hover:text-white'}`}
                                        onClick={() => setTab('history')}
                                    >
                                        History
                                    </button>
                                </div>
                            </div>
                            
                            {/* Tab Content */}
                            <div className="pt-2">
                                {tab === 'details' && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                                        <p className="text-gray-300">{model.description}</p>
                                        
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <h4 className="font-medium mb-2">Blockchain Details</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <p className="text-gray-400">Contract Address</p>
                                                    <p className="font-mono">0xabc...def</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Token Standard</p>
                                                    <p>ERC-721</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Blockchain</p>
                                                    <p>Polygon</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Minted</p>
                                                    <p>{formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {tab === 'properties' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-lg p-3 text-center">
                                            <p className="text-xs text-primary-light mb-1">CATEGORY</p>
                                            <p className="font-semibold">{model.category?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3 text-center">
                                            <p className="text-xs text-primary-light mb-1">RATING</p>
                                            <p className="font-semibold">{model.rating} / 5.0</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3 text-center">
                                            <p className="text-xs text-primary-light mb-1">DOWNLOADS</p>
                                            <p className="font-semibold">{model.downloads}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3 text-center">
                                            <p className="text-xs text-primary-light mb-1">VERSION</p>
                                            <p className="font-semibold">{model.version || '1.0'}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3 text-center">
                                            <p className="text-xs text-primary-light mb-1">RARITY</p>
                                            <p className="font-semibold">Uncommon</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3 text-center">
                                            <p className="text-xs text-primary-light mb-1">ROYALTY</p>
                                            <p className="font-semibold">10%</p>
                                        </div>
                                    </div>
                                )}
                                
                                {tab === 'history' && (
                                    <div className="space-y-3">
                                        {transactions.map((tx, index) => (
                                            <div key={index} className="bg-white/5 rounded-lg p-3">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <div className="flex items-center">
                                                            <span className="text-sm font-semibold">{tx.type}</span>
                                                            {tx.type === 'List' && (
                                                                <span className="ml-2 px-2 py-0.5 bg-primary-main/20 text-primary-light rounded text-xs">
                                                                    Active
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {formatDate(tx.date)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center justify-end">
                                                            <img 
                                                                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/matic.svg" 
                                                                alt="MATIC" 
                                                                className="w-3 h-3 mr-1"
                                                            />
                                                            <span>{tx.price?.toFixed(2) || '-'} MATIC</span>
                                                        </div>
                                                        <div className="flex text-xs text-gray-400 mt-1">
                                                            <span className="truncate w-20">
                                                                {tx.from ? `From ${tx.from}` : ''}
                                                            </span>
                                                            {tx.to && (
                                                                <span className="truncate w-20 text-right">
                                                                    To {tx.to}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white/5 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <p className="text-sm text-gray-400">Current Price</p>
                                        <div className="flex items-center">
                                            <img 
                                                src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/matic.svg" 
                                                alt="MATIC" 
                                                className="w-5 h-5 mr-2"
                                            />
                                            <span className="text-2xl font-bold">{model.price} MATIC</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">USD Value</p>
                                        <p className="text-lg font-semibold">${(model.price * 0.85).toFixed(2)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handlePurchase}
                                    disabled={loading}
                                    className={`
                                        w-full py-3 rounded-lg font-semibold flex items-center justify-center
                                        ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary-main hover:bg-primary-dark'}
                                    `}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <i className="fas fa-spinner fa-spin mr-2"></i>
                                            Processing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center">
                                            <i className="fas fa-shopping-cart mr-2"></i>
                                            Buy Now
                                        </span>
                                    )}
                                </button>
                                <div className="flex justify-center mt-3">
                                    <button className="text-sm text-gray-400 hover:text-white flex items-center">
                                        <i className="far fa-heart mr-1"></i>
                                        Add to Favorites
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2">Features</h3>
                                <ul className="list-disc list-inside text-gray-300 space-y-1">
                                    {model.features?.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white/5 p-4 rounded-lg">
                                <h3 className="font-semibold mb-3">Creator</h3>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden mr-3">
                                        <img 
                                            src={`https://avatars.dicebear.com/api/identicon/${model.author || 'unknown'}.svg`}
                                            alt="Creator"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{model.author || 'Unknown Creator'}</h4>
                                        <p className="text-xs text-gray-400">
                                            {model.authorVerified ? 'Verified Creator' : 'Creator'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <h4 className="font-medium mb-2">Requirements</h4>
                                        <ul className="text-sm text-gray-400 space-y-1">
                                            {model.requirements?.map((req, index) => (
                                                <li key={index}>{req}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-lg">
                                        <h4 className="font-medium mb-2">Use Cases</h4>
                                        <ul className="text-sm text-gray-400 space-y-1">
                                            {model.useCases?.map((useCase, index) => (
                                                <li key={index}>{useCase}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
