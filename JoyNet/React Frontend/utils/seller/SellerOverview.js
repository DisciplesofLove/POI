function SellerOverview({ analytics, recentSales, topProducts }) {
    try {
        return (
            <div className="space-y-8" data-name="seller-overview">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-effect rounded-xl p-6">
                        <h3 className="text-sm text-gray-400 mb-2">Total Revenue</h3>
                        <div className="flex items-center justify-between">
                            <p className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</p>
                            <div className="w-10 h-10 rounded-full bg-success-main/20 flex items-center justify-center">
                                <i className="fas fa-dollar-sign text-success-light"></i>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                            <span className="text-success-light">+12%</span> vs. last month
                        </p>
                    </div>
                    
                    <div className="glass-effect rounded-xl p-6">
                        <h3 className="text-sm text-gray-400 mb-2">Total Sales</h3>
                        <div className="flex items-center justify-between">
                            <p className="text-2xl font-bold">{analytics.totalSales}</p>
                            <div className="w-10 h-10 rounded-full bg-primary-main/20 flex items-center justify-center">
                                <i className="fas fa-shopping-cart text-primary-light"></i>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                            <span className="text-success-light">+8%</span> vs. last month
                        </p>
                    </div>
                    
                    <div className="glass-effect rounded-xl p-6">
                        <h3 className="text-sm text-gray-400 mb-2">Average Rating</h3>
                        <div className="flex items-center justify-between">
                            <p className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</p>
                            <div className="w-10 h-10 rounded-full bg-warning-main/20 flex items-center justify-center">
                                <i className="fas fa-star text-warning-light"></i>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">Based on {topProducts.length} products</p>
                    </div>
                    
                    <div className="glass-effect rounded-xl p-6">
                        <h3 className="text-sm text-gray-400 mb-2">Store Views</h3>
                        <div className="flex items-center justify-between">
                            <p className="text-2xl font-bold">{analytics.views}</p>
                            <div className="w-10 h-10 rounded-full bg-info-main/20 flex items-center justify-center">
                                <i className="fas fa-eye text-info-light"></i>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                            <span className="text-success-light">+15%</span> vs. last month
                        </p>
                    </div>
                </div>
                
                {/* Recent Sales */}
                <div className="glass-effect rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                                    <th className="pb-3 pl-2">Product</th>
                                    <th className="pb-3">Customer</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3 text-right pr-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSales.map(sale => (
                                    <tr key={sale.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-3 pl-2">{sale.product}</td>
                                        <td className="py-3">{sale.customer}</td>
                                        <td className="py-3">{new Date(sale.date).toLocaleDateString()}</td>
                                        <td className="py-3 text-right pr-2">${sale.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Top Products */}
                <div className="glass-effect rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Top Products</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {topProducts.slice(0, 4).map(product => (
                            <div key={product.id} className="bg-white/5 rounded-lg overflow-hidden">
                                <div className="aspect-video">
                                    <img 
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold mb-1 truncate">{product.name}</h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-primary-light font-medium">${product.price}</span>
                                        <span className="text-sm text-gray-400">{product.sales} sales</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("SellerOverview render error:", error);
        reportError(error);
        return (
            <div className="glass-effect rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
                <p className="text-gray-400">There was an error loading the overview data.</p>
            </div>
        );
    }
}
