function ModelList({ models }) {
    const [selectedModel, setSelectedModel] = React.useState(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4" data-name="model-list">
            {models.map(model => (
                <ModelCard 
                    key={model.id} 
                    model={model} 
                    onViewDetails={() => setSelectedModel(model)}
                />
            ))}
            
            {selectedModel && (
                <ModelDetailModal 
                    model={selectedModel}
                    onClose={() => setSelectedModel(null)}
                />
            )}
        </div>
    );
}
