function ProfilePage() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('marketplace');
    const [walletConnected, setWalletConnected] = React.useState(false);
    const [account, setAccount] = React.useState(null);
    const [marketplaceData, setMarketplaceData] = React.useState({
        itemsListed: [],
        itemsBought: [],
        itemsLeased: [],
        earnings: 0,
        totalSales: 0
    });
    const { error: showError, success } = useNotification();

    React.useEffect(() => {
        checkWalletAndLoadData();
    }, []);

    async function checkWalletAndLoadData() {
        try {
            setLoading(true);
            // Check if wallet is connected
            if (window.localStorage.getItem('walletConnected') === 'true') {
                const connection = await connectWallet();
                if (connection && connection.account) {
                    setWalletConnected(true);
                    setAccount(connection.account);
                    await loadMarketplaceData();
                }
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to check wallet connection:', error);
            reportError(error);
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
                await loadMarketplaceData();
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

    async function loadMarketplaceData() {
        try {
            setLoading(true);
            
            // In a real app, fetch from API
            // For demo, use mock data
            const mockData = {
                itemsListed: [
                    {
                        id: 1,
                        name: "Advanced Text Generation Model",
                        description: "State-of-the-art language model for text generation",
                        price: 499.99,
                        status: "active",
                        type: "sale",
                        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
                        views: 156,
                        likes: 23,
                        created: "2024-01-15"
                    },
                    {
                        id: 2,
                        name: "Image Generation Pro",
                        description: "Professional image generation model",
                        price: 299.99,
                        status: "pending",
                        type: "lease",
                        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
                        views: 89,
                        likes: 12,
                        created: "2024-01-20"
                    }
                ],
                itemsBought: [
                    {
                        id: 3,
                        name: "Data Analysis Suite",
                        description: "Comprehensive data analysis toolkit",
                        price: 199.99,
                        purchaseDate: "2024-01-10",
                        seller: "AI Solutions Inc",
                        status: "completed",
                        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f"
                    }
                ],
                itemsLeased: [
                    {
                        id: 4,
                        name: "Neural Network Framework",
                        description: "Enterprise neural network training framework",
                        price: 99.99,
                        leaseStart: "2024-01-05",
                        leaseEnd: "2024-02-05",
                        owner: "Deep Learning Labs",
                        status: "active",
                        image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c"
                    }
                ],
                earnings: 2499.95,
                totalSales: 15
            };
            
            setMarketplaceData(mockData);
        } catch (error) {
            console.error('Failed to load marketplace data:', error);
            reportError(error);
            showError('Failed to load marketplace data');
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
                    <h2 className="text-2xl font-bold mb-4">Connect Wallet to Access Marketplace</h2>
                    <p className="text-gray-400 mb-8">
                        Connect your wallet to start buying, selling, and managing your AI models.
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
                    <p className="text-sm text-gray-400 mt-4">
                        New to Web3? <a href="/help" className="text-primary-light hover:text-primary-main">Learn more about wallets</a>
                    </p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'marketplace', label: 'Marketplace', icon: 'fa-store' },
        { id: 'listed', label: 'Listed Items', icon: 'fa-tags' },
        { id: 'purchased', label: 'Purchased', icon: 'fa-shopping-cart' },
        { id: 'leased', label: 'Leased', icon: 'fa-clock' },
        { id: 'earnings', label: 'Earnings', icon: 'fa-chart-line' }
    ];

    return (
        <div className="container mx-auto px-4 py-20" data-name="marketplace-profile">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Marketplace Dashboard</h1>
                <button 
                    className="bg-primary-main hover:bg-primary-dark px-6 py-2 rounded-lg flex items-center"
                    onClick={() => window.navigateTo('/create-store')}
                >
                    <i className="fas fa-plus mr-2"></i>
                    List New Item
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="glass-effect rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-400">Total Earnings</h3>
                        <div className="w-10 h-10 rounded-full bg-success-main/20 flex items-center justify-center">
                            <i className="fas fa-dollar-sign text-success-light"></i>
                        </div>
                    </div>
                    <p className="text-2xl font-bold">${marketplaceData.earnings.toFixed(2)}</p>
                    <p className="text-sm text-success-light mt-2">
                        <i className="fas fa-arrow-up mr-1"></i>
                        12% vs last month
                    </p>
                </div>

                <div className="glass-effect rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-400">Active Listings</h3>
                        <div className="w-10 h-10 rounded-full bg-primary-main/20 flex items-center justify-center">
                            <i className="fas fa-tags text-primary-light"></i>
                        </div>
                    </div>
                    <p className="text-2xl font-bold">{marketplaceData.itemsListed.length}</p>
                    <p className="text-sm text-gray-400 mt-2">
                        {marketplaceData.itemsListed.filter(item => item.status === 'active').length} active items
                    </p>
                </div>

                <div className="glass-effect rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-400">Total Sales</h3>
                        <div className="w-10 h-10 rounded-full bg-info-main/20 flex items-center justify-center">
                            <i className="fas fa-shopping-cart text-info-light"></i>
                        </div>
                    </div>
                    <p className="text-2xl font-bold">{marketplaceData.totalSales}</p>
                    <p className="text-sm text-info-light mt-2">
                        <i className="fas fa-arrow-up mr-1"></i>
                        3 this week
                    </p>
                </div>

                <div className="glass-effect rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-400">Active Leases</h3>
                        <div className="w-10 h-10 rounded-full bg-warning-main/20 flex items-center justify-center">
                            <i className="fas fa-clock text-warning-light"></i>
                        </div>
                    </div>
                    <p className="text-2xl font-bold">{marketplaceData.itemsLeased.length}</p>
                    <p className="text-sm text-gray-400 mt-2">
                        {marketplaceData.itemsLeased.filter(item => item.status === 'active').length} active leases
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex overflow-x-auto mb-8 glass-effect rounded-xl p-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-6 py-3 rounded-lg mr-2 ${
                            activeTab === tab.id 
                                ? 'bg-primary-main text-white' 
                                : 'hover:bg-white/5'
                        }`}
                    >
                        <i className={`fas ${tab.icon} mr-2`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="glass-effect rounded-xl p-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div>
                        {/* Listed Items */}
                        {activeTab === 'listed' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold">Your Listed Items</h2>
                                    <div className="flex space-x-2">
                                        <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                                            <option value="all">All Types</option>
                                            <option value="sale">For Sale</option>
                                            <option value="lease">For Lease</option>
                                        </select>
                                        <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="pending">Pending</option>
                                            <option value="sold">Sold</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {marketplaceData.itemsListed.map(item => (
                                        <div key={item.id} className="bg-white/5 rounded-lg overflow-hidden">
                                            <div className="aspect-video">
                                                <img 
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold">{item.name}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        item.status === 'active' 
                                                            ? 'bg-success-main/20 text-success-light' 
                                                            : 'bg-warning-main/20 text-warning-light'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-400 mb-4">{item.description}</p>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xl font-bold">${item.price}</p>
                                                        <p className="text-sm text-gray-400">{item.type}</p>
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        <span className="mr-3">
                                                            <i className="far fa-eye mr-1"></i>
                                                            {item.views}
                                                        </span>
                                                        <span>
                                                            <i className="far fa-heart mr-1"></i>
                                                            {item.likes}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Purchased Items */}
                        {activeTab === 'purchased' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold mb-6">Your Purchased Items</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {marketplaceData.itemsBought.map(item => (
                                        <div key={item.id} className="bg-white/5 rounded-lg overflow-hidden">
                                            <div className="aspect-video">
                                                <img 
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold mb-2">{item.name}</h3>
                                                <p className="text-sm text-gray-400 mb-4">{item.description}</p>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xl font-bold">${item.price}</p>
                                                        <p className="text-sm text-gray-400">From: {item.seller}</p>
                                                    </div>
                                                    <button className="bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg">
                                                        Download
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Leased Items */}
                        {activeTab === 'leased' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold mb-6">Your Leased Items</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {marketplaceData.itemsLeased.map(item => (
                                        <div key={item.id} className="bg-white/5 rounded-lg overflow-hidden">
                                            <div className="aspect-video">
                                                <img 
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold mb-2">{item.name}</h3>
                                                <p className="text-sm text-gray-400 mb-4">{item.description}</p>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-400">Lease Period:</span>
                                                        <span>{new Date(item.leaseStart).toLocaleDateString()} - {new Date(item.leaseEnd).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-400">Owner:</span>
                                                        <span>{item.owner}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-400">Status:</span>
                                                        <span className={item.status === 'active' ? 'text-success-light' : 'text-warning-light'}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Earnings Tab */}
                        {activeTab === 'earnings' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold mb-6">Earnings Overview</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="glass-effect rounded-xl p-6">
                                        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                                        <div className="space-y-4">
                                            {marketplaceData.itemsListed.slice(0, 5).map(item => (
                                                <div key={item.id} className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-sm text-gray-400">{new Date(item.created).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className="text-success-light">+${item.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="glass-effect rounded-xl p-6">
                                        <h3 className="text-lg font-semibold mb-4">Revenue Statistics</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400">Total Revenue</span>
                                                <span className="text-xl font-bold">${marketplaceData.earnings.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400">Total Sales</span>
                                                <span>{marketplaceData.totalSales}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400">Average Price</span>
                                                <span>
                                                    ${(marketplaceData.earnings / marketplaceData.totalSales).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
