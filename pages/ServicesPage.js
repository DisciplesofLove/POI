function ServicesPage() {
    const [services, setServices] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState('all');

    const categories = [
        'all',
        'model-training',
        'data-annotation',
        'consulting',
        'deployment',
        'optimization'
    ];

    const sampleServices = [
        {
            id: 1,
            name: "Custom AI Model Training",
            description: "Professional training service for custom AI models with your data",
            image: "https://images.unsplash.com/photo-1551434678-e076c223a692",
            category: "model-training",
            price: "From $2,999",
            duration: "2-4 weeks",
            features: [
                "Custom model architecture",
                "Data preprocessing",
                "Performance optimization",
                "Deployment support"
            ]
        },
        {
            id: 2,
            name: "Data Annotation Service",
            description: "High-quality data labeling and annotation for AI training",
            image: "https://images.unsplash.com/photo-1551434678-e076c223a692",
            category: "data-annotation",
            price: "From $499",
            duration: "1-2 weeks",
            features: [
                "Multiple annotation types",
                "Quality assurance",
                "Quick turnaround",
                "Scalable teams"
            ]
        },
        // Add more sample services...
    ];

    React.useEffect(() => {
        loadServices();
    }, []);

    async function loadServices() {
        try {
            setLoading(true);
            // In a real app, fetch from API
            setServices(sampleServices);
        } catch (error) {
            reportError(error);
        } finally {
            setLoading(false);
        }
    }

    const filteredServices = services.filter(service => 
        filter === 'all' || service.category === filter
    );

    return (
        <div className="pt-20 pb-12" data-name="services-page">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">AI Services</h1>
                    <p className="text-gray-400">
                        Professional AI services from experts in the field.
                        Custom solutions for your specific needs.
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
                        {filteredServices.map(service => (
                            <div key={service.id} className="glass-effect rounded-xl p-4" data-name="service-card">
                                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                                    <img 
                                        src={service.image} 
                                        alt={service.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                                <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                                
                                <div className="mb-4">
                                    <h4 className="font-semibold mb-2">Features:</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-400">
                                        {service.features.map((feature, index) => (
                                            <li key={index}>{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                                    <div>
                                        <p className="text-sm text-gray-400">Starting at</p>
                                        <p className="text-xl font-bold">{service.price}</p>
                                        <p className="text-sm text-gray-400">Duration: {service.duration}</p>
                                    </div>
                                    <button className="bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg">
                                        Get Started
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
