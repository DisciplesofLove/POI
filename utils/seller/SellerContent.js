function SellerContent({
    activeSection,
    analytics,
    products,
    sales,
    aiModels,
    storeData,
    web3Status
}) {
    try {
        // Render the appropriate content based on active section
        switch (activeSection) {
            case 'overview':
                return <SellerOverview analytics={analytics} recentSales={sales.slice(0, 5)} topProducts={products} web3Status={web3Status} />;
            
            case 'products':
                return <SellerProducts products={products} />;
            
            case 'ai-models':
                return <SellerAIModels aiModels={aiModels} />;
            
            case 'orders':
                return <SellerOrders orders={sales} />;
            
            case 'analytics':
                return <SellerAnalytics analytics={analytics} products={products} />;
            
            case 'reviews':
                return <SellerReviews reviews={analytics.reviews} />;
            
            case 'blockchain':
                return <SellerBlockchain storeData={storeData} web3Status={web3Status} products={products} />;
            
            case 'settings':
                return <SellerSettings storeData={storeData} />;
            
            default:
                return (
                    <div className="glass-effect rounded-xl p-6 text-center">
                        <p>Section not found</p>
                    </div>
                );
        }
    } catch (error) {
        console.error("SellerContent render error:", error);
        reportError(error);
        
        // Fallback UI in case of error
        return (
            <div className="glass-effect rounded-xl p-6 text-center">
                <h2 className="text-xl font-semibold mb-4">Error Loading Content</h2>
                <p className="text-gray-400 mb-4">
                    There was an error loading this section. Please try again.
                </p>
                <button 
                    className="bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg"
                    onClick={() => window.location.reload()}
                >
                    Reload
                </button>
            </div>
        );
    }
}
