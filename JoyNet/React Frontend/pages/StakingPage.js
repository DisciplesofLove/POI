function StakingPage() {
    try {
        const [walletConnected, setWalletConnected] = React.useState(false);
        const [account, setAccount] = React.useState(null);
        const [loading, setLoading] = React.useState(true);
        const { currentUser } = useAuth();
        const { error: showError } = useNotification();

        React.useEffect(() => {
            checkWalletConnection();
        }, []);

        async function checkWalletConnection() {
            try {
                setLoading(true);
                
                if (window.localStorage.getItem('walletConnected') === 'true') {
                    const connection = await connectWallet();
                    setWalletConnected(true);
                    setAccount(connection.account);
                }
            } catch (error) {
                console.error("Failed to check wallet connection:", error);
                reportError(error);
            } finally {
                setLoading(false);
            }
        }

        async function handleConnectWallet() {
            try {
                setLoading(true);
                const connection = await connectWallet();
                setWalletConnected(true);
                setAccount(connection.account);
                window.localStorage.setItem('walletConnected', 'true');
            } catch (error) {
                console.error("Failed to connect wallet:", error);
                reportError(error);
                showError('Failed to connect wallet');
            } finally {
                setLoading(false);
            }
        }

        return (
            <div className="container mx-auto px-4 py-20" data-name="staking-page">
                <h1 className="text-3xl font-bold mb-8">JOY Token Staking</h1>
                
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Left Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="glass-effect rounded-xl p-4 sticky top-24" data-name="staking-sidebar">
                                <h2 className="text-xl font-semibold mb-4">Staking Stats</h2>
                                
                                <div className="space-y-4">
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <h3 className="text-sm text-gray-400 mb-1">Total Value Locked</h3>
                                        <p className="text-2xl font-bold">12.5M JOY</p>
                                    </div>
                                    
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <h3 className="text-sm text-gray-400 mb-1">Current APY</h3>
                                        <p className="text-2xl font-bold text-success-light">12.5%</p>
                                    </div>
                                    
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <h3 className="text-sm text-gray-400 mb-1">Stakers</h3>
                                        <p className="text-2xl font-bold">5,678</p>
                                    </div>
                                    
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <h3 className="text-sm text-gray-400 mb-1">JOY Price</h3>
                                        <p className="text-2xl font-bold">$1.25</p>
                                        <p className="text-xs text-success-light">+5.2% (24h)</p>
                                    </div>
                                </div>
                                
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <h3 className="font-semibold mb-2">Resources</h3>
                                    <ul className="space-y-2">
                                        <li>
                                            <a href="/docs/staking" className="text-primary-light hover:text-primary-main flex items-center">
                                                <i className="fas fa-book mr-2"></i>
                                                <span>Staking Guide</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/docs/tokenomics" className="text-primary-light hover:text-primary-main flex items-center">
                                                <i className="fas fa-chart-pie mr-2"></i>
                                                <span>JOY Tokenomics</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/community/forums" className="text-primary-light hover:text-primary-main flex items-center">
                                                <i className="fas fa-comments mr-2"></i>
                                                <span>Community Forum</span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {walletConnected ? (
                                <JoyTokenStaking userAddress={account} />
                            ) : (
                                <div className="glass-effect rounded-xl p-8 text-center">
                                    <div className="text-5xl text-gray-500 mb-4">
                                        <i className="fas fa-wallet"></i>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Wallet Not Connected</h3>
                                    <p className="text-gray-400 mb-6">
                                        Connect your wallet to start staking JOY tokens and earning rewards.
                                    </p>
                                    <button 
                                        className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold"
                                        onClick={handleConnectWallet}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center">
                                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                                Connecting...
                                            </span>
                                        ) : 'Connect Wallet'}
                                    </button>
                                </div>
                            )}
                            
                            {/* Info Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                <div className="glass-effect rounded-xl p-6">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                                        <i className="fas fa-vote-yea text-primary-light mr-3"></i>
                                        Governance Power
                                    </h3>
                                    <p className="text-gray-300 mb-4">
                                        Staking JOY tokens grants you voting rights in platform governance decisions.
                                        The more you stake, the more influence you have over the future of JoyNet.
                                    </p>
                                    <a 
                                        href="/governance" 
                                        className="text-primary-light hover:text-primary-main flex items-center text-sm"
                                    >
                                        <span>View Active Proposals</span>
                                        <i className="fas fa-chevron-right ml-1"></i>
                                    </a>
                                </div>
                                
                                <div className="glass-effect rounded-xl p-6">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                                        <i className="fas fa-robot text-primary-light mr-3"></i>
                                        AI Jobs
                                    </h3>
                                    <p className="text-gray-300 mb-4">
                                        Earn additional rewards by contributing your computational resources
                                        to the JoyNet ecosystem through AI validation jobs.
                                    </p>
                                    <a 
                                        href="/settings?tab=ai-jobs" 
                                        className="text-primary-light hover:text-primary-main flex items-center text-sm"
                                    >
                                        <span>Configure AI Jobs</span>
                                        <i className="fas fa-chevron-right ml-1"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error("StakingPage render error:", error);
        reportError(error);
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Error Loading Staking Page</h2>
                <p className="text-gray-400 mb-8">There was an error loading the staking page.</p>
                <button 
                    className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }
}
