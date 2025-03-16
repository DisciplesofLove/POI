function DocumentationPage() {
    const sections = [
        {
            title: "Getting Started",
            icon: "fa-rocket",
            items: [
                "Introduction to JoyNet",
                "Quick Start Guide",
                "Platform Overview",
                "Key Concepts"
            ]
        },
        {
            title: "Model Integration",
            icon: "fa-plug",
            items: [
                "API Integration",
                "SDK Usage",
                "WebSocket Connections",
                "Error Handling"
            ]
        },
        {
            title: "Smart Contracts",
            icon: "fa-file-contract",
            items: [
                "Contract Overview",
                "Token Standards",
                "Marketplace Contracts",
                "Security"
            ]
        },
        {
            title: "Guides & Tutorials",
            icon: "fa-book",
            items: [
                "Model Deployment",
                "Testing & Validation",
                "Best Practices",
                "Troubleshooting"
            ]
        }
    ];

    return (
        <div className="pt-20 pb-12" data-name="documentation">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">Documentation</h1>
                    <p className="text-gray-400">
                        Everything you need to know about using JoyNet's AI marketplace and platform
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search documentation..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white"
                        />
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sections.map((section, index) => (
                        <div 
                            key={index} 
                            className="glass-effect rounded-xl p-6"
                            data-name={`doc-section-${index}`}
                        >
                            <div className="flex items-center mb-6">
                                <i className={`fas ${section.icon} text-2xl text-primary-main mr-4`}></i>
                                <h2 className="text-xl font-semibold">{section.title}</h2>
                            </div>
                            <ul className="space-y-3">
                                {section.items.map((item, itemIndex) => (
                                    <li key={itemIndex}>
                                        <a 
                                            href="#" 
                                            className="text-gray-400 hover:text-white flex items-center"
                                        >
                                            <i className="fas fa-chevron-right text-xs mr-2"></i>
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <button className="mt-6 text-primary-main hover:text-primary-light text-sm flex items-center">
                                View All
                                <i className="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Popular Articles */}
                <div className="mt-12 pt-12 border-t border-white/10">
                    <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="glass-effect rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-2">Getting Started with AI Models</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Learn how to deploy and integrate AI models into your applications.
                            </p>
                            <a href="#" className="text-primary-main hover:text-primary-light text-sm">
                                Read More →
                            </a>
                        </div>
                        <div className="glass-effect rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-2">Understanding Smart Contracts</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Deep dive into the blockchain technology behind JoyNet.
                            </p>
                            <a href="#" className="text-primary-main hover:text-primary-light text-sm">
                                Read More →
                            </a>
                        </div>
                        <div className="glass-effect rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-2">API Integration Guide</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Step-by-step guide to integrating JoyNet's API.
                            </p>
                            <a href="#" className="text-primary-main hover:text-primary-light text-sm">
                                Read More →
                            </a>
                        </div>
                    </div>
                </div>

                {/* Help & Support */}
                <div className="mt-12 text-center">
                    <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
                    <p className="text-gray-400 mb-6">
                        Can't find what you're looking for? Reach out to our support team.
                    </p>
                    <button className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold">
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
}
