function TrainingPage() {
    const trainingServices = [
        {
            id: 1,
            title: "Custom Model Training",
            description: "Professional training service for your custom AI models",
            image: "https://images.unsplash.com/photo-1551434678-e076c223a692",
            features: [
                "Customized training pipeline",
                "Data preprocessing",
                "Model optimization",
                "Performance monitoring"
            ],
            pricing: {
                basic: {
                    name: "Basic",
                    price: "$999",
                    features: [
                        "Single model training",
                        "Basic optimization",
                        "Email support",
                        "5 iterations"
                    ]
                },
                pro: {
                    name: "Professional",
                    price: "$2,499",
                    features: [
                        "Multiple model training",
                        "Advanced optimization",
                        "Priority support",
                        "Unlimited iterations"
                    ]
                }
            }
        },
        {
            id: 2,
            title: "Transfer Learning Service",
            description: "Leverage pre-trained models for your specific use case",
            image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c",
            features: [
                "Model selection guidance",
                "Fine-tuning process",
                "Performance evaluation",
                "Deployment support"
            ],
            pricing: {
                basic: {
                    name: "Basic",
                    price: "$799",
                    features: [
                        "Single model adaptation",
                        "Basic fine-tuning",
                        "Email support",
                        "3 iterations"
                    ]
                },
                pro: {
                    name: "Professional",
                    price: "$1,999",
                    features: [
                        "Multiple model adaptation",
                        "Advanced fine-tuning",
                        "Priority support",
                        "Unlimited iterations"
                    ]
                }
            }
        }
    ];

    return (
        <div className="pt-20 pb-12" data-name="training">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">AI Model Training Services</h1>
                    <p className="text-gray-400">
                        Professional training services to help you build and optimize your AI models
                    </p>
                </div>

                {/* Services */}
                <div className="space-y-12">
                    {trainingServices.map(service => (
                        <div 
                            key={service.id}
                            className="glass-effect rounded-xl overflow-hidden"
                            data-name={`training-service-${service.id}`}
                        >
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="aspect-video md:aspect-auto">
                                    <img 
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold mb-4">{service.title}</h2>
                                    <p className="text-gray-400 mb-6">{service.description}</p>
                                    
                                    <h3 className="font-semibold mb-3">Key Features:</h3>
                                    <ul className="list-disc list-inside text-gray-400 mb-6">
                                        {service.features.map((feature, index) => (
                                            <li key={index}>{feature}</li>
                                        ))}
                                    </ul>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {Object.values(service.pricing).map((plan, index) => (
                                            <div 
                                                key={index}
                                                className="bg-white/5 rounded-lg p-4"
                                            >
                                                <h4 className="font-semibold mb-2">{plan.name}</h4>
                                                <p className="text-2xl font-bold mb-4">{plan.price}</p>
                                                <ul className="text-sm text-gray-400 space-y-2">
                                                    {plan.features.map((feature, fIndex) => (
                                                        <li key={fIndex} className="flex items-center">
                                                            <i className="fas fa-check text-success-main mr-2"></i>
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button className="w-full mt-4 bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg">
                                                    Choose Plan
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Custom Requirements */}
                <div className="mt-12 text-center">
                    <h2 className="text-2xl font-bold mb-4">Need Custom Training?</h2>
                    <p className="text-gray-400 mb-6">
                        Contact us to discuss your specific requirements and get a custom quote
                    </p>
                    <button className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold">
                        Contact Sales
                    </button>
                </div>
            </div>
        </div>
    );
}
