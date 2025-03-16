function SettingsPage() {
    try {
        const [activeTab, setActiveTab] = React.useState('profile');
        const [walletConnected, setWalletConnected] = React.useState(false);
        const [account, setAccount] = React.useState(null);
        const { currentUser } = useAuth();
        const { success, error: showError } = useNotification();
        const [loading, setLoading] = React.useState(false);

        React.useEffect(() => {
            checkWalletConnection();
            
            // Check if there's a tab parameter in the URL
            const urlParams = new URLSearchParams(window.location.search);
            const tabParam = urlParams.get('tab');
            if (tabParam && tabs.some(tab => tab.id === tabParam)) {
                setActiveTab(tabParam);
            }
        }, []);

        async function checkWalletConnection() {
            try {
                if (window.localStorage.getItem('walletConnected') === 'true') {
                    const connection = await connectWallet();
                    setWalletConnected(true);
                    setAccount(connection.account);
                }
            } catch (error) {
                console.error("Failed to check wallet connection:", error);
                reportError(error);
            }
        }

        async function handleConnectWallet() {
            try {
                setLoading(true);
                const connection = await connectWallet();
                setWalletConnected(true);
                setAccount(connection.account);
                window.localStorage.setItem('walletConnected', 'true');
                success('Wallet connected successfully');
            } catch (error) {
                console.error("Failed to connect wallet:", error);
                reportError(error);
                showError('Failed to connect wallet');
            } finally {
                setLoading(false);
            }
        }

        // Tabs configuration
        const tabs = [
            { id: 'profile', label: 'Profile', icon: 'fa-user' },
            { id: 'account', label: 'Account', icon: 'fa-gear' },
            { id: 'wallet', label: 'Wallet & Web3', icon: 'fa-wallet' },
            { id: 'notifications', label: 'Notifications', icon: 'fa-bell' },
            { id: 'ai-jobs', label: 'AI Jobs', icon: 'fa-robot' },
            { id: 'api', label: 'API Keys', icon: 'fa-key' },
            { id: 'privacy', label: 'Privacy', icon: 'fa-shield' },
            { id: 'appearance', label: 'Appearance', icon: 'fa-palette' }
        ];

        // Handle tab change and update URL
        function handleTabChange(tabId) {
            setActiveTab(tabId);
            
            // Update URL without refreshing the page
            const url = new URL(window.location);
            url.searchParams.set('tab', tabId);
            window.history.pushState({}, '', url);
        }

        // Render the appropriate tab content
        function renderTabContent() {
            switch(activeTab) {
                case 'profile':
                    return <ProfilePanel />;
                case 'account':
                    return <AccountPanel />;
                case 'wallet':
                    return <WalletPanel walletConnected={walletConnected} account={account} onConnect={handleConnectWallet} />;
                case 'notifications':
                    return <NotificationsPanel />;
                case 'ai-jobs':
                    return <AIJobsPanel userAddress={account} />;
                case 'api':
                    return <APIKeysPanel />;
                case 'privacy':
                    return <PrivacyPanel />;
                case 'appearance':
                    return <AppearancePanel />;
                default:
                    return <ProfilePanel />;
            }
        }

        return (
            <div className="container mx-auto px-4 py-20" data-name="settings-page">
                <h1 className="text-3xl font-bold mb-8">Settings</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="glass-effect rounded-xl p-4 sticky top-24" data-name="settings-sidebar">
                            <div className="space-y-1">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                                            activeTab === tab.id
                                                ? 'bg-primary-main text-white'
                                                : 'hover:bg-white/5'
                                        }`}
                                        onClick={() => handleTabChange(tab.id)}
                                    >
                                        <i className={`fas ${tab.icon} w-6`}></i>
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="glass-effect rounded-xl p-6">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("SettingsPage render error:", error);
        reportError(error);
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Error Loading Settings</h2>
                <p className="text-gray-400 mb-8">There was an error loading the settings page.</p>
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
