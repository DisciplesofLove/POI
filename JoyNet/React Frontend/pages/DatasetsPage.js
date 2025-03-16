function DatasetsPage() {
    const [datasets, setDatasets] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState('all');

    const categories = [
        'all',
        'text-corpus',
        'image-data',
        'audio-data',
        'sensor-data',
        'structured-data',
        'time-series'
    ];

    const sampleDatasets = [
        {
            id: 1,
            name: "Global Language Dataset",
            description: "Comprehensive multilingual text corpus with 100+ languages",
            image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8",
            category: "text-corpus",
            price: 299.99,
            size: "2.3TB",
            records: "1.2B",
            format: "JSON/CSV"
        },
        {
            id: 2,
            name: "Medical Imaging Collection",
            description: "High-quality medical imaging dataset for healthcare AI",
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
            category: "image-data",
            price: 499.99,
            size: "1.8TB",
            records: "500K",
            format: "DICOM/PNG"
        },
        // Add more sample datasets...
    ];

    React.useEffect(() => {
        loadDatasets();
    }, []);

    async function loadDatasets() {
        try {
            setLoading(true);
            // In a real app, fetch from API
            setDatasets(sampleDatasets);
        } catch (error) {
            reportError(error);
        } finally {
            setLoading(false);
        }
    }

    const filteredDatasets = datasets.filter(dataset => 
        filter === 'all' || dataset.category === filter
    );

    return (
        <div className="pt-20 pb-12" data-name="datasets-page">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">AI Training Datasets</h1>
                    <p className="text-gray-400">
                        High-quality, curated datasets for training AI models. 
                        All datasets are verified and come with detailed documentation.
                    </p>
                </div>

                {/* Category Filter */}
                <div className="mb-8 flex flex-wrap gap-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setFilter(category)}
                            className={`px-4 py-2 rounded-full ${
                                filter === category
                                    ? 'bg-primary-main text-white'
                                    : 'bg-white/5 hover:bg-white/10'
                            }`}
                        >
                            {category.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <i className="fas fa-spinner fa-spin text-4xl"></i>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDatasets.map(dataset => (
                            <div key={dataset.id} className="glass-effect rounded-xl p-4" data-name="dataset-card">
                                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                                    <img 
                                        src={dataset.image} 
                                        alt={dataset.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                <h3 className="text-xl font-semibold mb-2">{dataset.name}</h3>
                                <p className="text-gray-400 text-sm mb-4">{dataset.description}</p>
                                
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="text-center p-2 bg-white/5 rounded-lg">
                                        <p className="text-sm text-gray-400">Size</p>
                                        <p className="font-semibold">{dataset.size}</p>
                                    </div>
                                    <div className="text-center p-2 bg-white/5 rounded-lg">
                                        <p className="text-sm text-gray-400">Records</p>
                                        <p className="font-semibold">{dataset.records}</p>
                                    </div>
                                    <div className="text-center p-2 bg-white/5 rounded-lg">
                                        <p className="text-sm text-gray-400">Format</p>
                                        <p className="font-semibold">{dataset.format}</p>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-bold">${dataset.price}</span>
                                    <button className="bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
