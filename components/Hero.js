function Hero({ onConnect }) {
    const [loading, setLoading] = React.useState(false);
    const { error: showError } = useNotification();

    async function handleConnect() {
        try {
            setLoading(true);
            await onConnect();
        } catch (error) {
            console.error("Connection error:", error);
            reportError(error);
            showError('Failed to connect wallet');
        } finally {
            setLoading(false);
        }
    }

    function handleExplore() {
        window.navigateTo('/browse/models');
    }

    return (
        <div className="hero-gradient min-h-[600px] flex items-center pt-20" data-name="hero">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl" data-name="hero-content">
                    <h1 className="text-5xl font-bold mb-6" data-name="hero-title">
                        Discover and Deploy Advanced AI Models
                    </h1>
                    <p className="text-xl text-gray-300 mb-8" data-name="hero-description">
                        The first decentralized marketplace for AI models, datasets, and services.
                        Trade with confidence using blockchain technology.
                    </p>
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4" data-name="hero-buttons">
                        <button 
                            onClick={handleConnect}
                            disabled={loading}
                            className={`
                                px-8 py-3 rounded-lg font-semibold
                                ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary-main hover:bg-primary-dark'}
                            `}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Connecting...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <i className="fas fa-wallet mr-2"></i>
                                    Connect Wallet
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={handleExplore}
                            className="border border-white/20 hover:border-white/40 px-8 py-3 rounded-lg font-semibold"
                        >
                            Explore Marketplace
                        </button>
                    </div>
                    
                    {/* Stats */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-effect rounded-lg p-4 text-center">
                            <h3 className="text-2xl font-bold gradient-text">1,234+</h3>
                            <p className="text-gray-400">AI Models</p>
                        </div>
                        <div className="glass-effect rounded-lg p-4 text-center">
                            <h3 className="text-2xl font-bold gradient-text">$2.5M+</h3>
                            <p className="text-gray-400">Trading Volume</p>
                        </div>
                        <div className="glass-effect rounded-lg p-4 text-center">
                            <h3 className="text-2xl font-bold gradient-text">5,678+</h3>
                            <p className="text-gray-400">Active Users</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
