function RecentModels() {
    const [selectedModel, setSelectedModel] = React.useState(null);
    const recentModels = [
        {
            id: 4,
            name: "VoiceWizard",
            description: "Next-gen voice synthesis and processing",
            image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618",
            rating: 4.5,
            downloads: 3200,
            price: 59.99
        },
        {
            id: 5,
            name: "DataInsight Pro",
            description: "Advanced data analysis and visualization",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
            rating: 4.6,
            downloads: 2800,
            price: 69.99
        }
    ];

    return (
        <section className="py-12 bg-white/5" data-name="recent-models">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8 gradient-text">Recently Added</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recentModels.map(model => (
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
