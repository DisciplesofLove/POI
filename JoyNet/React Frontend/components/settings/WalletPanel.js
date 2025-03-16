function WalletPanel({ walletConnected, account, onConnect }) {
    try {
        const { success, error: showError } = useNotification();
        const [loading, setLoading] = React.useState(false);
        const [walletSettings, setWalletSettings] = React.useState({
            defaultNetwork: 'polygon',
            autoConnect: true,
            showBalances: true,
            gasPreference: 'standard',
            tokenGating: false,
            nftVerification: true
        });

        function handleChange(e) {
            const { name, value, type, checked } = e.target;
            setWalletSettings(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        async function handleSubmit(e) {
            e.preventDefault();
            
            try {
                setLoading(true);
                
                // In a real app, this would call an API to update the settings
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
                
                success('Wallet settings updated successfully');
            } catch (error) {
                console.error("Failed to update wallet settings:", error);
                reportError(error);
                showError('Failed to update wallet settings');
            } finally {
                setLoading(false);
            }
        }

        return (
            <div data-name="wallet-settings">
                <h2 className="text-2xl font-semibold mb-6">Wallet & Web3 Settings</h2>
                
                {walletConnected ? (
                    <div className="space-y-8">
                        <div className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold">Connected Wallet</h3>
                                <p className="text-sm text-gray-400">
                                    {account}
                                </p>
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-sm">Connected</span>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Network Settings</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Default Network</label>
                                        <select
                                            name="defaultNetwork"
                                            value={walletSettings.defaultNetwork}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                        >
                                            <option value="polygon">Polygon</option>
                                            <option value="ethereum">Ethereum</option>
                                            <option value="optimism">Optimism</option>
                                            <option value="arbitrum">Arbitrum</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Gas Price Preference</label>
                                        <select
                                            name="gasPreference"
                                            value={walletSettings.gasPreference}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                        >
                                            <option value="slow">Slow (Cheaper)</option>
                                            <option value="standard">Standard</option>
                                            <option value="fast">Fast (More Expensive)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-t border-white/10 pt-6">
                                <h3 className="text-lg font-semibold mb-4">Display Settings</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Auto-connect Wallet</h4>
                                            <p className="text-sm text-gray-400">Automatically connect your wallet on page load</p>
                                        </div>
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                name="autoConnect"
                                                checked={walletSettings.autoConnect}
                                                onChange={handleChange}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Show Token Balances</h4>
                                            <p className="text-sm text-gray-400">Display your token balances in the interface</p>
                                        </div>
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                name="showBalances"
                                                checked={walletSettings.showBalances}
                                                onChange={handleChange}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-t border-white/10 pt-6">
                                <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Token Gating</h4>
                                            <p className="text-sm text-gray-400">Restrict access to your content based on token ownership</p>
                                        </div>
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                name="tokenGating"
                                                checked={walletSettings.tokenGating}
                                                onChange={handleChange}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">NFT Verification</h4>
                                            <p className="text-sm text-gray-400">Enable verification of NFT ownership</p>
                                        </div>
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                name="nftVerification"
                                                checked={walletSettings.nftVerification}
                                                onChange={handleChange}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end pt-4 border-t border-white/10">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`
                                        px-8 py-3 rounded-lg font-semibold
                                        ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary-main hover:bg-primary-dark'}
                                    `}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <i className="fas fa-spinner fa-spin mr-2"></i>
                                            Saving...
                                        </span>
                                    ) : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl text-gray-500 mb-4">
                            <i className="fas fa-wallet"></i>
                        </div>
                        <h3 className="text-xl font-semibold mb-4">No Wallet Connected</h3>
                        <p className="text-gray-400 mb-6">
                            Connect your wallet to access web3 settings and features.
                        </p>
                        <button
                            onClick={onConnect}
                            className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold"
                        >
                            Connect Wallet
                        </button>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error("WalletPanel render error:", error);
        reportError(error);
        return <div>Error loading wallet settings</div>;
    }
}
