function DashboardPage() {
    const [loading, setLoading] = React.useState(true);
    const [walletConnected, setWalletConnected] = React.useState(false);
    const [account, setAccount] = React.useState(null);
    const [dashboardData, setDashboardData] = React.useState({
        totalEarnings: 0,
        totalSales: 0,
        activeListings: 0,
        pendingOrders: 0,
        recentActivity: [],
        popularModels: []
    });
    const { success, error: showError } = useNotification();
    const { currentUser } = useAuth();

    React.useEffect(() => {
        checkWalletConnection();
    }, []);

    async function checkWalletConnection() {
        try {
            setLoading(true);
            if (window.localStorage.getItem('walletConnected') === 'true') {
                const connection = await connectWallet();
                if (connection && connection.account) {
                    setWalletConnected(true);
                    setAccount(connection.account);
                    await loadDashboardData(connection.account);
                }
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to check wallet connection:', error);
            reportError(error);
            setLoading(false);
        }
    }

    async function loadDashboardData(userAddress) {
        try {
            setLoading(true);
            
            // In a real app, fetch from API
            // For demo, use mock data
            const mockData = {
                totalEarnings: 2589.45,
                totalSales: 28,
                activeListings: 12,
                pendingOrders: 3,
                recentActivity: [
                    {
                        id: 1,
                        type: 'sale',
                        title: 'New Sale',
                        description: 'TextGen Pro was purchased',
                        amount: 149.99,
                        timestamp: new Date(Date.now() - 3600000).toISOString()
                    },
                    {
                        id: 2,
                        type: 'listing',
                        title: 'New Listing',
                        description: 'Image Generator v2 was listed',
                        timestamp: new Date(Date.now() - 7200000).toISOString()
                    },
                    {
                        id: 3,
                        type: 'review',
                        title: 'New Review',
                        description: '5-star review received for DataAnalyzer',
                        timestamp: new Date(Date.now() - 10800000).toISOString()
                    }
                ],
                popularModels: [
                    {
                        id: 1,
                        name: 'TextGen Pro',
                        sales: 15,
                        revenue: 749.95,
                        rating: 4.8
                    },
                    {
                        id: 2,
                        name: 'Image Generator',
                        sales: 8,
                        revenue: 559.92,
                        rating: 4.9
                    },
                    {
                        id: 3,
                        name: 'DataAnalyzer',
                        sales: 5,
                        revenue: 299.95,
                        rating: 4.7
                    }
                ]
            };
            
            setDashboardData(mockData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            reportError(error);
            showError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }

    async function handleConnectWallet() {
        try {
            setLoading(true);
            const connection = await connectWallet();
            if (connection && connection.account) {
                setWalletConnected(true);
                setAccount(connection.account);
                window.localStorage.setItem('walletConnected', 'true');
                await loadDashboardData(connection.account);
                success('Wallet connected successfully');
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            reportError(error);
            showError('Failed to connect wallet');
        } finally {
            setLoading(false);
        }
    }

    if (!walletConnected) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-lg mx-auto glass-effect rounded-xl p-8">
                    <div className="text-6xl text-gray-500 mb-6">
                        <i className="fas fa-wallet"></i>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Connect Wallet to View Dashboard</h2>
                    <p className="text-gray-400 mb-8">
                        Connect your wallet to view your earnings, sales, and manage your listings.
                    </p>
                    <button 
                        className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold w-full flex items-center justify-center"
                        onClick={handleConnectWallet}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Connecting...
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <i className="fas fa-wallet mr-2"></i>
                                Connect Wallet
                            </span>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-20" data-name="dashboard">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <button 
                    className="bg-primary-main hover:bg-primary-dark px-6 py-2 rounded-lg flex items-center"
                    onClick={() => window.navigateTo('/list-model')}
                >
                    <i className="fas fa-plus mr-2"></i>
                    List New Item
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="glass-effect rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-gray-400">Total Earnings</h3>
                                <div className="w-10 h-10 rounded-full bg-success-main/20 flex items-center justify-center">
                                    <i className="fas fa-dollar-sign text-success-light"></i>
                                </div>
                            </div>
                            <p className="text-2xl font-bold">${dashboardData.totalEarnings.toFixed(2)}</p>
                            <p className="text-sm text-success-light mt-2">
                                <i className="fas fa-arrow-up mr-1"></i>
                                12% vs last month
                            </p>
                        </div>

                        <div className="glass-effect rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-gray-400">Total Sales</h3>
                                <div className="w-10 h-10 rounded-full bg-primary-main/20 flex items-center justify-center">
                                    <i className="fas fa-shopping-cart text-primary-light"></i>
                                </div>
                            </div>
                            <p className="text-2xl font-bold">{dashboardData.totalSales}</p>
                            <p className="text-sm text-success-light mt-2">
                                <i className="fas fa-arrow-up mr-1"></i>
                                8% vs last month
                            </p>
                        </div>

                        <div className="glass-effect rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-gray-400">Active Listings</h3>
                                <div className="w-10 h-10 rounded-full bg-info-main/20 flex items-center justify-center">
                                    <i className="fas fa-tags text-info-light"></i>
                                </div>
                            </div>
                            <p className="text-2xl font-bold">{dashboardData.activeListings}</p>
                            <p className="text-sm text-gray-400 mt-2">
                                {dashboardData.pendingOrders} pending orders
                            </p>
                        </div>

                        <div className="glass-effect rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-gray-400">Wallet Balance</h3>
                                <div className="w-10 h-10 rounded-full bg-warning-main/20 flex items-center justify-center">
                                    <i className="fas fa-wallet text-warning-light"></i>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <img 
                                    src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/matic.svg" 
                                    alt="MATIC" 
                                    className="w-5 h-5 mr-2"
                                />
                                <p className="text-2xl font-bold">1,234.56 MATIC</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity & Popular Models */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass-effect rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                            <div className="space-y-4">
                                {dashboardData.recentActivity.map(activity => (
                                    <div 
                                        key={activity.id}
                                        className="flex items-start space-x-4"
                                    >
                                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                                            ${activity.type === 'sale' ? 'bg-success-main/20' :
                                              activity.type === 'listing' ? 'bg-primary-main/20' :
                                              'bg-warning-main/20'}
                                        `}>
                                            <i className={`
                                                fas 
                                                ${activity.type === 'sale' ? 'fa-shopping-cart text-success-light' :
                                                  activity.type === 'listing' ? 'fa-tag text-primary-light' :
                                                  'fa-star text-warning-light'}
                                            `}></i>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{activity.title}</p>
                                            <p className="text-sm text-gray-400">{activity.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        {activity.amount && (
                                            <div className="text-success-light font-medium">
                                                +${activity.amount}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-effect rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">Popular Models</h2>
                            <div className="space-y-4">
                                {dashboardData.popularModels.map(model => (
                                    <div 
                                        key={model.id}
                                        className="bg-white/5 rounded-lg p-4"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium">{model.name}</h3>
                                                <div className="flex items-center mt-1">
                                                    <div className="flex items-center text-yellow-500 mr-4">
                                                        <i className="fas fa-star mr-1"></i>
                                                        <span>{model.rating}</span>
                                                    </div>
                                                    <span className="text-gray-400">{model.sales} sales</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-success-light font-medium">
                                                    ${model.revenue.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">Revenue</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
