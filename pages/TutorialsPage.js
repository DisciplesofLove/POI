function TutorialsPage() {
    const tutorials = [
        {
            id: 1,
            title: "Getting Started with AI Model Deployment",
            difficulty: "Beginner",
            duration: "30 mins",
            image: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387",
            topics: [
                "Basic concepts",
                "Environment setup",
                "First deployment"
            ]
        },
        {
            id: 2,
            title: "Advanced Model Training Techniques",
            difficulty: "Advanced",
            duration: "1 hour",
            image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c",
            topics: [
                "Hyperparameter tuning",
                "Transfer learning",
                "Model optimization"
            ]
        },
        {
            id: 3,
            title: "Building Custom AI Pipelines",
            difficulty: "Intermediate",
            duration: "45 mins",
            image: "https://images.unsplash.com/photo-1551434678-e076c223a692",
            topics: [
                "Pipeline architecture",
                "Data preprocessing",
                "Error handling"
            ]
        }
    ];

    const categories = [
        "All",
        "Getting Started",
        "Model Training",
        "Deployment",
        "Integration",
        "Best Practices"
    ];

    return (
        <div className="pt-20 pb-12" data-name="tutorials">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Tutorials & Guides</h1>
                    <p className="text-gray-400">
                        Learn how to make the most of JoyNet's AI marketplace with our comprehensive tutorials
                    </p>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {categories.map(category => (
                        <button
                            key={category}
                            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10"
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Tutorials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutorials.map(tutorial => (
                        <div 
                            key={tutorial.id}
                            className="glass-effect rounded-xl overflow-hidden"
                            data-name={`tutorial-${tutorial.id}`}
                        >
                            <div className="aspect-video">
                                <img 
                                    src={tutorial.image} 
                                    alt={tutorial.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-primary-main">{tutorial.difficulty}</span>
                                    <span className="text-sm text-gray-400">{tutorial.duration}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-4">{tutorial.title}</h3>
                                <div className="space-y-2">
                                    {tutorial.topics.map((topic, index) => (
                                        <div key={index} className="flex items-center">
                                            <i className="fas fa-check-circle text-success-main mr-2"></i>
                                            <span className="text-sm text-gray-400">{topic}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="mt-6 w-full bg-primary-main hover:bg-primary-dark py-2 rounded-lg font-semibold">
                                    Start Tutorial
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Newsletter */}
                <div className="mt-12 pt-12 border-t border-white/10 text-center">
                    <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
                    <p className="text-gray-400 mb-6">
                        Subscribe to our newsletter to receive new tutorials directly in your inbox
                    </p>
                    <div className="max-w-md mx-auto">
                        <Newsletter />
                    </div>
                </div>
            </div>
        </div>
    );
}
