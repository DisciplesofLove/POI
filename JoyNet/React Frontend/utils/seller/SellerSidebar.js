function SellerSidebar({ 
    storeData, 
    web3Status, 
    activeSection, 
    sellerSections, 
    onSectionChange,
    onConnectWallet
}) {
    try {
        return (
            <div className="glass-effect rounded-xl p-4 sticky top-24">
                {/* Store Info */}
                <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                        <img 
                            src={storeData?.logo} 
                            alt={storeData?.name}
                            className="w-12 h-12 rounded-full"
                        />
                        <div>
                            <h3 className="font-semibold">{storeData?.name}</h3>
                            <div className="flex items-center text-sm space-x-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    storeData?.status === 'active' 
                                        ? 'bg-success-main/20 text-success-light' 
                                        : 'bg-warning-main/20 text-warning-light'
                                }`}>
                                    {storeData?.status === 'active' ? 'Active' : 'Pending'}
                                </span>
                                {storeData?.verified && (
                                    <span className="bg-primary-main/20 text-primary-light px-2 py-0.5 rounded-full text-xs flex items-center">
                                        <i className="fas fa-check-circle mr-1 text-xs"></i>
                                        Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-sm">
                        <div className="flex justify-between mb-1">
                            <span className="text-gray-400">Rating:</span>
                            <span className="flex items-center">
                                <i className="fas fa-star text-yellow-500 mr-1"></i>
                                {storeData?.rating} ({storeData?.reviewCount} reviews)
                            </span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="text-gray-400">Created:</span>
                            <span>{new Date(storeData?.createdAt).toLocaleDateString()}</span>
                        </div>
                        {web3Status.connected && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">JOY Balance:</span>
                                <span className="font-medium text-primary-light">{web3Status.balance} JOY</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Web3 Status */}
                <div className="mb-6 pb-6 border-b border-white/10">
                    <h4 className="text-sm font-semibold mb-3">Blockchain Status</h4>
                    {web3Status.connected ? (
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-success-light rounded-full mr-2"></div>
                                <span className="text-sm">Connected to {web3Status.network}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-success-light rounded-full mr-2"></div>
                                <span className="text-sm">Store NFT Verified</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-error-light rounded-full mr-2"></div>
                                <span className="text-sm">Not Connected</span>
                            </div>
                            <button 
                                className="w-full bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg text-sm mt-2"
                                onClick={onConnectWallet}
                            >
                                Connect Wallet
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Navigation */}
                <div className="space-y-2">
                    {sellerSections.map(section => (
                        <button
                            key={section.id}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                                activeSection === section.id
                                    ? 'bg-primary-main text-white'
                                    : 'hover:bg-white/5'
                            }`}
                            onClick={() => onSectionChange(section.id)}
                        >
                            <i className={`fas ${section.icon} w-6`}></i>
                            <span>{section.label}</span>
                        </button>
                    ))}
                </div>
                
                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-semibold mb-4">Quick Actions</h4>
                    <div className="space-y-2">
                        <button className="w-full bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg text-sm flex items-center justify-center">
                            <i className="fas fa-plus mr-2"></i>
                            Add New Product
                        </button>
                        <button className="w-full bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg text-sm flex items-center justify-center">
                            <i className="fas fa-robot mr-2"></i>
                            Create AI Model
                        </button>
                        <button className="w-full bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm flex items-center justify-center">
                            <i className="fas fa-eye mr-2"></i>
                            View Store
                        </button>
                    </div>
                </div>

                {/* Store Stats */}
                <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-semibold mb-4">Store Stats</h4>
                    <div className="space-y-3">
                        <div className="bg-white/5 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Products</span>
                                <span className="font-semibold">
                                    {storeData?.productCount || '0'}
                                </span>
                            </div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Models</span>
                                <span className="font-semibold">
                                    {storeData?.modelCount || '0'}
                                </span>
                            </div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Customers</span>
                                <span className="font-semibold">
                                    {storeData?.customerCount || '0'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Web3 Integration */}
                {web3Status.connected && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <h4 className="text-sm font-semibold mb-4">Blockchain Integration</h4>
                        <div className="space-y-3">
                            <div className="bg-white/5 p-3 rounded-lg">
                                <h5 className="text-sm font-medium mb-2">Store NFT Contract</h5>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400">Contract:</span>
                                    <span className="font-mono text-primary-light truncate max-w-[120px]">
                                        {storeData?.web3?.contractAddress}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg">
                                <h5 className="text-sm font-medium mb-2">Token Gating</h5>
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${
                                        storeData?.web3?.tokenGating ? 'bg-success-light' : 'bg-gray-400'
                                    }`}></div>
                                    <span className="text-sm">
                                        {storeData?.web3?.tokenGating ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                            <button className="w-full bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm flex items-center justify-center">
                                <i className="fas fa-cog mr-2"></i>
                                Manage Web3 Settings
                            </button>
                        </div>
                    </div>
                )}

                {/* AI Cloud Integration */}
                <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-semibold mb-4">AI Cloud Integration</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">API Status:</span>
                            <span className="flex items-center">
                                <div className="w-2 h-2 bg-success-light rounded-full mr-2"></div>
                                <span className="text-sm">Online</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">AI Models:</span>
                            <span className="text-sm">5 Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Compute Credits:</span>
                            <span className="text-sm">2,500</span>
                        </div>
                        <button className="w-full bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm flex items-center justify-center">
                            <i className="fas fa-cloud mr-2"></i>
                            AI Cloud Dashboard
                        </button>
                    </div>
                </div>

                {/* Help & Support */}
                <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-semibold mb-2">Help & Support</h4>
                    <div className="space-y-2 mt-3">
                        <button className="w-full text-left text-sm text-primary-light hover:text-primary-main flex items-center">
                            <i className="fas fa-book w-6"></i>
                            <span>Seller Documentation</span>
                        </button>
                        <button className="w-full text-left text-sm text-primary-light hover:text-primary-main flex items-center">
                            <i className="fas fa-question-circle w-6"></i>
                            <span>Get Support</span>
                        </button>
                        <button className="w-full text-left text-sm text-primary-light hover:text-primary-main flex items-center">
                            <i className="fas fa-video w-6"></i>
                            <span>Video Tutorials</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("SellerSidebar render error:", error);
        reportError(error);
        
        // Fallback UI in case of error
        return (
            <div className="glass-effect rounded-xl p-4">
                <div className="text-center py-4">
                    <p className="text-error-light mb-2">Error loading sidebar</p>
                    <button 
                        className="bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg text-sm"
                        onClick={() => window.location.reload()}
                    >
                        Reload
                    </button>
                </div>
            </div>
        );
    }
}
