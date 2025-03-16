function TopModels() {
    const [selectedModel, setSelectedModel] = React.useState(null);
    const topModels = [
        {
            id: 6,
            name: "ChatBot Elite",
            description: "Enterprise-grade conversational AI",
            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
            rating: 5.0,
            downloads: 25000,
            price: 149.99
        },
        {
            id: 7,
            name: "VideoMaster AI",
            description: "Professional video editing and generation",
            image: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb",
            rating: 4.9,
            downloads: 18500,
            price: 129.99
        }
    ];

    return (
        <section className="py-12" data-name="top-models">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 gradient-text">Top Models</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {topModels.map(model => (
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
