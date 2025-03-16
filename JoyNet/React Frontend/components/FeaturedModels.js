function FeaturedModels() {
    const [selectedModel, setSelectedModel] = React.useState(null);
    const featuredModels = [
        {
            id: 1,
            name: "TextMaster Pro",
            description: "Advanced text generation and analysis",
            image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
            rating: 4.8,
            downloads: 12500,
            price: 49.99
        },
        {
            id: 2,
            name: "ImageGenius",
            description: "Create stunning images with AI",
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
            rating: 4.9,
            downloads: 8900,
            price: 79.99
        },
        {
            id: 3,
            name: "CodeAssist AI",
            description: "Your intelligent coding companion",
            image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c",
            rating: 4.7,
            downloads: 15200,
            price: 39.99
        }
    ];

    return (
        <section id="featured" className="py-12" data-name="featured-models">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 gradient-text">Featured Models</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredModels.map(model => (
                        <ModelCard 
                            key={model.id} 
                            model={model} 
                            onViewDetails={() => setSelectedModel(model)}
                        />
                    ))}
                </div>
            </div>
            
            {selectedModel && (
                <ModelDetailModal 
                    model={selectedModel}
                    onClose={() => setSelectedModel(null)}
                />
            )}
        </section>
    );
}
