function ModelDetailModal({ model, onClose }) {
    const [loading, setLoading] = React.useState(false);
    const [tab, setTab] = React.useState('details'); // details, properties, history
    const { success, error: showError } = useNotification();
    const { currentUser } = useAuth();
    const [showPayment, setShowPayment] = React.useState(false);

    async function handlePurchase() {
        try {
            if (!currentUser) {
                showError('Please connect your wallet to purchase this NFT');
                return;
            }

            setShowPayment(true);
        } catch (error) {
            console.error('Purchase failed:', error);
            reportError(error);
            showError('Failed to initiate purchase');
        }
    }

    function handlePaymentSuccess(order) {
        // Close payment modal
        setShowPayment(false);
        // Close detail modal after a short delay
        setTimeout(() => {
            onClose();
        }, 1500);
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
                        {/* Left column content remains the same... */}

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
                                        <span className="flex items-center">
                                            <i className="fas fa-spinner fa-spin mr-2"></i>
                                            Processing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
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

                            {/* Rest of the right column content remains the same... */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <PaymentModal 
                    model={model}
                    onClose={() => setShowPayment(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}
