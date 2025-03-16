function AdminPanel() {
    const [activeSection, setActiveSection] = React.useState('dashboard');
    const [loading, setLoading] = React.useState(false);
    const { currentUser } = useAuth();
    const { error: showError, success } = useNotification();
    
    // Check if user has admin permissions
    const isAdmin = currentUser?.role === 'admin';
    
    if (!isAdmin) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="glass-effect rounded-xl p-8 max-w-lg mx-auto">
                    <i className="fas fa-lock text-5xl text-gray-500 mb-4"></i>
                    <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                    <p className="text-gray-400 mb-6">
                        You don't have permission to access the admin panel.
                        Please contact an administrator if you believe this is an error.
                    </p>
                    <button 
                        className="bg-primary-main hover:bg-primary-dark px-6 py-2 rounded-lg"
                        onClick={() => window.history.back()}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }
    
    const adminSections = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
        { id: 'users', label: 'Users', icon: 'fa-users' },
        { id: 'models', label: 'AI Models', icon: 'fa-robot' },
        { id: 'stores', label: 'Stores', icon: 'fa-store' },
        { id: 'transactions', label: 'Transactions', icon: 'fa-exchange-alt' },
        { id: 'reports', label: 'Reports', icon: 'fa-chart-bar' },
        { id: 'settings', label: 'Settings', icon: 'fa-cog' }
    ];
    
    return (
        <div className="container mx-auto px-4 py-20" data-name="admin-panel">
            <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1" data-name="admin-sidebar">
                    <div className="glass-effect rounded-xl p-4 sticky top-24">
                        <div className="space-y-2">
                            {adminSections.map(section => (
                                <button
                                    key={section.id}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                                        activeSection === section.id
                                            ? 'bg-primary-main text-white'
                                            : 'hover:bg-white/5'
                                    }`}
                                    onClick={() => setActiveSection(section.id)}
                                >
                                    <i className={`fas ${section.icon} w-6`}></i>
                                    <span>{section.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Main Content */}
                <div className="lg:col-span-4" data-name="admin-content">
                    {activeSection === 'dashboard' && <AdminDashboard />}
                    {activeSection === 'users' && <AdminUsers />}
                    {activeSection === 'models' && <AdminModels />}
                    {activeSection === 'stores' && <AdminStores />}
                    {activeSection === 'transactions' && <AdminTransactions />}
                    {activeSection === 'reports' && <AdminReports />}
                    {activeSection === 'settings' && <AdminSettings />}
                </div>
            </div>
        </div>
    );
}

// Dashboard Component
function AdminDashboard() {
    const [stats, setStats] = React.useState({
        totalUsers: 0,
        activeUsers: 0,
        totalModels: 0,
        totalStores: 0,
        totalSales: 0,
        pendingApprovals: 0
    });
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
        loadDashboardData();
    }, []);
    
    async function loadDashboardData() {
        try {
            setLoading(true);
            
            // In a real app, this would fetch from API
            // For demo purposes, we'll use mock data
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setStats({
                totalUsers: 5678,
                activeUsers: 1243,
                totalModels: 1234,
                totalStores: 567,
                totalSales: 234567.89,
                pendingApprovals: 23
            });
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            reportError(error);
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <div className="space-y-8" data-name="admin-dashboard">
            <div className="glass-effect rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-6">Platform Overview</h2>
                
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-sm text-gray-400 mb-1">Total Users</h3>
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                                <div className="w-10 h-10 rounded-full bg-primary-main/20 flex items-center justify-center">
                                    <i className="fas fa-users text-primary-light"></i>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                                <span className="text-success-light">+12%</span> this month
                            </p>
                        </div>
                        
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-sm text-gray-400 mb-1">Total AI Models</h3>
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-bold">{stats.totalModels.toLocaleString()}</p>
                                <div className="w-10 h-10 rounded-full bg-info-main/20 flex items-center justify-center">
                                    <i className="fas fa-robot text-info-light"></i>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                                <span className="text-success-light">+8%</span> this month
                            </p>
                        </div>
                        
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-sm text-gray-400 mb-1">Total Sales</h3>
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-bold">${stats.totalSales.toLocaleString()}</p>
                                <div className="w-10 h-10 rounded-full bg-success-main/20 flex items-center justify-center">
                                    <i className="fas fa-dollar-sign text-success-light"></i>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                                <span className="text-success-light">+15%</span> this month
                            </p>
                        </div>
                        
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-sm text-gray-400 mb-1">Active Users (24h)</h3>
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                                <div className="w-10 h-10 rounded-full bg-warning-main/20 flex items-center justify-center">
                                    <i className="fas fa-user-clock text-warning-light"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-sm text-gray-400 mb-1">Total Stores</h3>
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-bold">{stats.totalStores.toLocaleString()}</p>
                                <div className="w-10 h-10 rounded-full bg-info-main/20 flex items-center justify-center">
                                    <i className="fas fa-store text-info-light"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white/5 rounded-lg p-4">
                            <h3 className="text-sm text-gray-400 mb-1">Pending Approvals</h3>
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                                <div className="w-10 h-10 rounded-full bg-error-main/20 flex items-center justify-center">
                                    <i className="fas fa-clock text-error-light"></i>
                                </div>
                            </div>
                            <button className="text-sm text-primary-light hover:text-primary-main mt-2">
                                Review Now
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="glass-effect rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
                
                {/* Activity list would go here */}
                <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-user-plus text-primary-light"></i>
                        </div>
                        <div>
                            <p className="font-medium">New user registered</p>
                            <p className="text-sm text-gray-400">John Doe created a new account</p>
                            <p className="text-xs text-gray-500 mt-1">10 minutes ago</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-robot text-info-light"></i>
                        </div>
                        <div>
                            <p className="font-medium">New AI model submitted</p>
                            <p className="text-sm text-gray-400">ImageMaster Pro by AI Solutions Inc.</p>
                            <p className="text-xs text-gray-500 mt-1">25 minutes ago</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-shopping-cart text-success-light"></i>
                        </div>
                        <div>
                            <p className="font-medium">New purchase</p>
                            <p className="text-sm text-gray-400">TextAnalyzer Pro purchased for $59.99</p>
                            <p className="text-xs text-gray-500 mt-1">42 minutes ago</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-flag text-warning-light"></i>
                        </div>
                        <div>
                            <p className="font-medium">Model reported</p>
                            <p className="text-sm text-gray-400">DataCruncher model reported for license violation</p>
                            <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                        </div>
                    </div>
                </div>
                
                <button className="mt-6 text-primary-light hover:text-primary-main text-sm">
                    View All Activity
                </button>
            </div>
        </div>
    );
}

// Placeholder components for other admin sections
function AdminUsers() {
    return (
        <div className="glass-effect rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-6">User Management</h2>
            <p>User management functionality will be implemented here.</p>
        </div>
    );
}

function AdminModels() {
    return (
        <div className="glass-effect rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-6">AI Model Management</h2>
            <p>AI model management functionality will be implemented here.</p>
        </div>
    );
}

function AdminStores() {
    return (
        <div className="glass-effect rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-6">Store Management</h2>
            <p>Store management functionality will be implemented here.</p>
        </div>
    );
}

function AdminTransactions() {
    return (
        <div className="glass-effect rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-6">Transaction History</h2>
            <p>Transaction history functionality will be implemented here.</p>
        </div>
    );
}

function AdminReports() {
    return (
        <div className="glass-effect rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-6">Reports & Analytics</h2>
            <p>Reports and analytics functionality will be implemented here.</p>
        </div>
    );
}

function AdminSettings() {
    return (
        <div className="glass-effect rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-6">Platform Settings</h2>
            <p>Platform settings functionality will be implemented here.</p>
        </div>
    );
}
