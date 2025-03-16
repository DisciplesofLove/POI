function SellerAnalytics({ analytics, products }) {
    try {
        return (
            <div className="space-y-8" data-name="seller-analytics">
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
                        <p className="text-sm text-gray-400 mt-2">Based on {products.length} products</p>
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

                {/* Sales Trend Chart */}
                <div className="glass-effect rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Sales Trend</h2>
                    <div className="h-72">
                        <SalesChart data={analytics.monthlySales} />
                    </div>
                </div>

                {/* Product Performance */}
                <div className="glass-effect rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Product Performance</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                                    <th className="pb-3 pl-2">Product</th>
                                    <th className="pb-3">Sales</th>
                                    <th className="pb-3">Revenue</th>
                                    <th className="pb-3">Conversion Rate</th>
                                    <th className="pb-3 text-right pr-2">Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.productPerformance.map((product, index) => (
                                    <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-3 pl-2 font-medium">{product.name}</td>
                                        <td className="py-3">{product.sales}</td>
                                        <td className="py-3">${product.revenue.toFixed(2)}</td>
                                        <td className="py-3">
                                            {(product.sales / (product.sales * 8) * 100).toFixed(1)}%
                                        </td>
                                        <td className="py-3 text-right pr-2">
                                            <div className="inline-block w-16 h-8">
                                                <MiniTrendChart />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Customer Demographics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-effect rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4">Customer Demographics</h2>
                        <div className="h-64">
                            <DemographicsChart />
                        </div>
                    </div>
                    <div className="glass-effect rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4">Geographic Distribution</h2>
                        <div className="h-64">
                            <GeographicChart />
                        </div>
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="glass-effect rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Traffic Sources</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="h-64">
                                <TrafficSourcesChart />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-white/5 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span>Direct</span>
                                    <span className="font-semibold">35%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div className="bg-primary-main h-2 rounded-full" style={{ width: '35%' }}></div>
                                </div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span>Search</span>
                                    <span className="font-semibold">28%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div className="bg-success-main h-2 rounded-full" style={{ width: '28%' }}></div>
                                </div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span>Social</span>
                                    <span className="font-semibold">22%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div className="bg-info-main h-2 rounded-full" style={{ width: '22%' }}></div>
                                </div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span>Referral</span>
                                    <span className="font-semibold">15%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div className="bg-warning-main h-2 rounded-full" style={{ width: '15%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export Data */}
                <div className="flex justify-end">
                    <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg flex items-center">
                        <i className="fas fa-download mr-2"></i>
                        Export Analytics Data
                    </button>
                </div>
            </div>
        );
    } catch (error) {
        console.error("SellerAnalytics render error:", error);
        reportError(error);
        return (
            <div className="glass-effect rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Analytics</h2>
                <p className="text-gray-400">There was an error loading the analytics data.</p>
            </div>
        );
    }
}

// Chart Components
function SalesChart({ data }) {
    try {
        // In a real implementation, you'd use a charting library like Chart.js or Recharts
        // This is a simplified placeholder visualization
        const maxValue = Math.max(...data.data);
        
        return (
            <div className="w-full h-full flex flex-col">
                <div className="flex-1 flex items-end">
                    {data.data.map((value, index) => {
                        const height = (value / maxValue) * 100;
                        return (
                            <div 
                                key={index} 
                                className="flex-1 flex flex-col items-center justify-end mx-1"
                            >
                                <div 
                                    className="w-full bg-primary-main/80 hover:bg-primary-main rounded-t-sm transition-all"
                                    style={{ height: `${height}%` }}
                                >
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="h-8 flex mt-2">
                    {data.labels.map((label, index) => (
                        <div key={index} className="flex-1 text-center text-xs text-gray-400">
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        );
    } catch (error) {
        console.error("SalesChart render error:", error);
        reportError(error);
        return <div className="w-full h-full bg-white/5 flex items-center justify-center">Chart Error</div>;
    }
}

function MiniTrendChart() {
    try {
        // Simple placeholder for a trend sparkline
        const trendData = [3, 7, 5, 8, 6, 9];
        const maxValue = Math.max(...trendData);
        const minValue = Math.min(...trendData);
        const range = maxValue - minValue;
        
        return (
            <div className="w-full h-full flex items-end">
                {trendData.map((value, index) => {
                    const height = range === 0 ? 50 : ((value - minValue) / range) * 100;
                    const isPositive = index > 0 && value > trendData[index - 1];
                    return (
                        <div 
                            key={index} 
                            className="flex-1 flex flex-col items-center justify-end"
                        >
                            <div 
                                className={`w-1 ${isPositive ? 'bg-success-light' : 'bg-primary-light'} rounded-t-sm`}
                                style={{ height: `${height}%` }}
                            >
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    } catch (error) {
        console.error("MiniTrendChart render error:", error);
        reportError(error);
        return null;
    }
}

function DemographicsChart() {
    try {
        // Placeholder for a demographics chart
        const demographics = [
            { label: '18-24', value: 15 },
            { label: '25-34', value: 35 },
            { label: '35-44', value: 25 },
            { label: '45-54', value: 15 },
            { label: '55+', value: 10 }
        ];
        
        return (
            <div className="w-full h-full flex flex-col justify-center">
                <div className="space-y-4">
                    {demographics.map((item, index) => (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                                <span>{item.label}</span>
                                <span>{item.value}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                                <div 
                                    className="bg-primary-main h-2 rounded-full" 
                                    style={{ width: `${item.value}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    } catch (error) {
        console.error("DemographicsChart render error:", error);
        reportError(error);
        return <div className="w-full h-full bg-white/5 flex items-center justify-center">Chart Error</div>;
    }
}

function GeographicChart() {
    try {
        // Placeholder for a geographic distribution chart
        const regions = [
            { name: 'North America', value: 45 },
            { name: 'Europe', value: 30 },
            { name: 'Asia', value: 15 },
            { name: 'Other', value: 10 }
        ];
        
        return (
            <div className="w-full h-full flex flex-col">
                <div className="flex-1 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-primary-main/30 flex items-center justify-center">
                                    <i className="fas fa-globe text-2xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    {regions.map((region, index) => (
                        <div key={index} className="flex items-center">
                            <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ 
                                    backgroundColor: index === 0 ? '#6c2bd9' : 
                                                      index === 1 ? '#8347e5' : 
                                                      index === 2 ? '#38a169' : '#d69e2e'
                                }}
                            ></div>
                            <div className="flex-1 flex justify-between">
                                <span className="text-sm">{region.name}</span>
                                <span className="text-sm">{region.value}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    } catch (error) {
        console.error("GeographicChart render error:", error);
        reportError(error);
        return <div className="w-full h-full bg-white/5 flex items-center justify-center">Chart Error</div>;
    }
}

function TrafficSourcesChart() {
    try {
        // Placeholder for a traffic sources donut chart
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-40 h-40">
                    {/* This is a simplified donut chart representation */}
                    <div className="absolute inset-0 rounded-full border-8 border-primary-main"></div>
                    <div 
                        className="absolute rounded-full border-8 border-success-main"
                        style={{ 
                            top: 0, right: 0, bottom: 0, left: 0,
                            clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 50% 100%)'
                        }}
                    ></div>
                    <div 
                        className="absolute rounded-full border-8 border-info-main"
                        style={{ 
                            top: 0, right: 0, bottom: 0, left: 0,
                            clipPath: 'polygon(50% 50%, 100% 100%, 0 100%, 0 70%, 50% 50%)'
                        }}
                    ></div>
                    <div 
                        className="absolute rounded-full border-8 border-warning-main"
                        style={{ 
                            top: 0, right: 0, bottom: 0, left: 0,
                            clipPath: 'polygon(50% 50%, 0 70%, 0 0, 50% 0, 50% 50%)'
                        }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-28 h-28 rounded-full bg-secondary-main"></div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("TrafficSourcesChart render error:", error);
        reportError(error);
        return <div className="w-full h-full bg-white/5 flex items-center justify-center">Chart Error</div>;
    }
}
