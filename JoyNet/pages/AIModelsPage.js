import React from 'react';
import AIModelList from '../components/AIModelList';
import SearchBar from '../components/SearchBar';

function AIModelsPage() {
    try {
        const [models, setModels] = React.useState([]);
        const [loading, setLoading] = React.useState(true);
        const [filter, setFilter] = React.useState('all'); // Changed default to lowercase 'all' to match filter logic
        const [searchTerm, setSearchTerm] = React.useState('');
        const [selectedModel, setSelectedModel] = React.useState(null);
        const { error: showError } = useNotification();

        React.useEffect(() => {
            loadModels();
        }, []);

        async function loadModels() {
            try {
                setLoading(true);
                
                // In a real app, this would fetch from API
                // Sample data for demonstration
                const sampleModels = [
                    {
                        id: 1,
                        name: "TextMaster Pro",
                        description: "Advanced text generation and analysis model with support for multiple languages and domains. Ideal for content creation, summarization, and text analysis.",
                        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                        category: "text-generation",
                        rating: 4.8,
                        downloads: 12500,
                        price: 49.99,
                        version: "2.3.0",
                        author: "AI Research Labs",
                        features: [
                            "Multi-language support (50+ languages)",
                            "Domain-specific fine-tuning",
                            "Sentiment analysis",
                            "Content summarization",
                            "Creative writing assistance"
                        ],
                        requirements: [
                            "4GB RAM minimum",
                            "2GB storage space",
                            "API key required"
                        ],
                        useCases: [
                            "Content marketing",
                            "Customer support",
                            "Academic research",
                            "Creative writing"
                        ],
                        updatedAt: "2023-08-15"
                    },
                    {
                        id: 2,
                        name: "ImageGenius",
                        description: "State-of-the-art image generation model that creates stunning visuals from text descriptions. Perfect for designers, marketers, and creative professionals.",
                        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80",
                        category: "image-generation",
                        rating: 4.9,
                        downloads: 8900,
                        price: 79.99,
                        version: "1.5.2",
                        author: "Creative AI Solutions",
                        features: [
                            "High-resolution output (up to 4K)",
                            "Style transfer capabilities",
                            "Customizable parameters",
                            "Batch processing",
                            "Commercial usage rights"
                        ],
                        requirements: [
                            "8GB RAM recommended",
                            "GPU acceleration supported",
                            "5GB storage space"
                        ],
                        useCases: [
                            "Digital art creation",
                            "Advertising and marketing",
                            "Product visualization",
                            "Game asset development"
                        ],
                        updatedAt: "2023-09-02"
                    },
                    {
                        id: 3,
                        name: "CodeAssist AI",
                        description: "Intelligent coding assistant that helps developers write better code faster. Supports multiple programming languages and frameworks.",
                        image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                        category: "developer-tools",
                        rating: 4.7,
                        downloads: 15200,
                        price: 39.99,
                        version: "3.1.0",
                        author: "DevTech AI",
                        features: [
                            "Code completion and suggestions",
                            "Bug detection and fixes",
                            "Code refactoring assistance",
                            "Documentation generation",
                            "Multiple IDE integrations"
                        ],
                        requirements: [
                            "2GB RAM minimum",
                            "Compatible with VS Code, IntelliJ, and more",
                            "Internet connection required"
                        ],
                        useCases: [
                            "Software development",
                            "Code review",
                            "Learning programming",
                            "Technical documentation"
                        ],
                        updatedAt: "2023-07-28"
                    },
                    {
                        id: 4,
                        name: "VoiceWizard",
                        description: "Advanced voice synthesis and processing model that generates natural-sounding speech in multiple languages and accents.",
                        image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                        category: "audio-processing",
                        rating: 4.5,
                        downloads: 7200,
                        price: 59.99,
                        version: "2.0.1",
                        author: "Audio AI Labs",
                        features: [
                            "Natural voice synthesis",
                            "40+ languages and accents",
                            "Emotion and tone control",
                            "Real-time processing",
                            "Custom voice training"
                        ],
                        requirements: [
                            "4GB RAM minimum",
                            "Audio output device",
                            "Microphone for input features"
                        ],
                        useCases: [
                            "Audiobook production",
                            "Virtual assistants",
                            "Accessibility tools",
                            "Gaming and entertainment"
                        ],
                        updatedAt: "2023-08-05"
                    },
                    {
                        id: 5,
                        name: "DataInsight Pro",
                        description: "Comprehensive data analysis and visualization model that helps extract meaningful insights from complex datasets.",
                        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
                        category: "data-analysis",
                        rating: 4.6,
                        downloads: 6300,
                        price: 69.99,
                        version: "2.2.0",
                        author: "DataSci Solutions",
                        features: [
                            "Automated data cleansing",
                            "Advanced statistical analysis",
                            "Interactive visualizations",
                            "Predictive modeling",
                            "Report generation"
                        ],
                        requirements: [
                            "8GB RAM recommended",
                            "Compatible with CSV, JSON, SQL databases",
                            "3GB storage space"
                        ],
                        useCases: [
                            "Business intelligence",
                            "Scientific research",
                            "Financial analysis",
                            "Marketing optimization"
                        ],
                        updatedAt: "2023-07-15"
                    }
                ];
                
                setModels(sampleModels);
            } catch (error) {
                console.error("Failed to load models:", error);
                reportError(error);
                showError('Failed to load AI models');
            } finally {
                setLoading(false);
            }
        }

        const handleModelClick = (model) => {
            setSelectedModel(model);
        };

        const handleCloseModal = () => {
            setSelectedModel(null);
        };

        const handleSearch = (term) => {
            setSearchTerm(term);
        };

        const categories = [
            'all', // Changed to lowercase to match filter state
            'Text Generation', 
            'Image Generation', 
            'Developer Tools', 
            'Audio Processing',
            'Video Processing', 
            'Data Analysis', 
            'Natural Language',
            'Healthcare',
            'Security'
        ];

        // Filter models based on category and search term
        const filteredModels = models.filter(model => {
            const categoryMatch = filter === 'all' || 
                model.category === filter.toLowerCase().replace(' ', '-');
            
            const searchMatch = !searchTerm || 
                model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                model.description.toLowerCase().includes(searchTerm.toLowerCase());
                
            return categoryMatch && searchMatch;
        });

        return (
            <div className="pt-20 pb-12" data-name="ai-models-page">
                <div className="container mx-auto px-4">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-4">AI Models Marketplace</h1>
                        <p className="text-gray-400 mb-6">
                            Discover and deploy cutting-edge AI models created by leading researchers and developers.
                            All models are verified and ready to integrate into your projects.
                        </p>
                        
                        {/* Search Bar */}
                        <SearchBar onSearch={handleSearch} />
                    </div>
                    
                    {/* Category Filter */}
                    <div className="mb-8 overflow-x-auto py-2">
                        <div className="flex space-x-2 min-w-max">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setFilter(category.toLowerCase())}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap ${
                                        filter === category.toLowerCase()
                                            ? 'bg-primary-main text-white' 
                                            : 'bg-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div>
                            {filteredModels.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredModels.map(model => (
                                        <div 
                                            key={model.id} 
                                            className="cursor-pointer"
                                        >
                                            <ModelCard 
                                                model={model} 
                                                onViewDetails={() => handleModelClick(model)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 glass-effect rounded-xl">
                                    <i className="fas fa-search text-4xl text-gray-500 mb-4"></i>
                                    <h3 className="text-xl font-semibold mb-2">No models found</h3>
                                    <p className="text-gray-400">
                                        Try adjusting your search or filter criteria
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Model Detail Modal */}
                    {selectedModel && (
                        <ModelDetailModal 
                            model={selectedModel}
                            onClose={handleCloseModal}
                        />
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error("AIModelsPage render error:", error);
        reportError(error);
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Error Loading Models</h2>
                <p className="text-gray-400 mb-8">There was an error loading the AI models.</p>
                <button 
                    className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }
}
