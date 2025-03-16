function AlgorithmsPage() {
    const [algorithms, setAlgorithms] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState('all');

    const categories = [
        'all',
        'machine-learning',
        'deep-learning',
        'optimization',
        'computer-vision',
        'nlp',
        'reinforcement-learning'
    ];

    const sampleAlgorithms = [
        {
            id: 1,
            name: "Advanced Neural Architecture Search",
            description: "Automated neural network architecture optimization algorithm",
            image: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d",
            category: "deep-learning",
            price: 799.99,
            complexity: "O(n log n)",
            language: "Python",
            framework: "PyTorch"
        },
        {
            id: 2,
            name: "Quantum-Inspired Optimization",
            description: "Novel optimization algorithm inspired by quantum computing principles",
            image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
            category: "optimization",
            price: 999.99,
            complexity: "O(n²)",
            language: "Python/C++",
            framework: "Custom"
        }
    ];

    React.useEffect(() => {
        loadAlgorithms();
    }, []);

    async function loadAlgorithms() {
        try {
            setLoading(true);
            // In a real app, fetch from API
            setAlgorithms(sampleAlgorithms);
        } catch (error) {
            reportError(error);
        } finally {
            setLoading(false);
        }
    }

    const filteredAlgorithms = algorithms.filter(algo => 
        filter === 'all' || algo.category === filter
    );

    return (
        <div className="pt-20 pb-12" data-name="algorithms-page">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">AI Algorithms</h1>
                    <p className="text-gray-400">
                        Explore cutting-edge AI algorithms and implementations.
                        All algorithms are thoroughly tested and optimized for production use.
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
                        {filteredAlgorithms.map(algorithm => (
                            <div key={algorithm.id} className="glass-effect rounded-xl p-4" data-name="algorithm-card">
                                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                                    <img 
                                        src={algorithm.image} 
                                        alt={algorithm.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                <h3 className="text-xl font-semibold mb-2">{algorithm.name}</h3>
                                <p className="text-gray-400 text-sm mb-4">{algorithm.description}</p>
                                
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="p-2 bg-white/5 rounded-lg">
                                        <p className="text-sm text-gray-400">Complexity</p>
                                        <p className="font-semibold">{algorithm.complexity}</p>
                                    </div>
                                    <div className="p-2 bg-white/5 rounded-lg">
                                        <p className="text-sm text-gray-400">Language</p>
                                        <p className="font-semibold">{algorithm.language}</p>
                                    </div>
                                    <div className="p-2 bg-white/5 rounded-lg">
                                        <p className="text-sm text-gray-400">Framework</p>
                                        <p className="font-semibold">{algorithm.framework}</p>
                                    </div>
                                    <div className="p-2 bg-white/5 rounded-lg">
                                        <p className="text-sm text-gray-400">Category</p>
                                        <p className="font-semibold">{algorithm.category}</p>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                                    <span className="text-2xl font-bold">${algorithm.price}</span>
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
