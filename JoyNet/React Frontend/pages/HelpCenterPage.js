function HelpCenterPage() {
    const faqs = [
        {
            question: "How do I connect my wallet?",
            answer: "Click the 'Connect Wallet' button in the top right corner and select your preferred wallet (MetaMask, WalletConnect, etc.). Follow the prompts to complete the connection."
        },
        {
            question: "How do I mint an AI NFT?",
            answer: "Go to the 'Create' page, fill in your AI model details, upload your files, set a price, and click 'Create NFT'. Make sure your wallet is connected and has sufficient MATIC for gas fees."
        },
        {
            question: "What blockchain does JoyNet use?",
            answer: "JoyNet operates on the Polygon network for fast, low-cost transactions. Make sure your wallet is configured for Polygon mainnet."
        }
    ];

    const categories = [
        {
            icon: "fa-wallet",
            title: "Wallet & Transactions",
            description: "Learn about connecting wallets and managing transactions"
        },
        {
            icon: "fa-paint-brush",
            title: "Creating & Minting",
            description: "Guide to creating and minting AI NFTs"
        },
        {
            icon: "fa-shopping-cart",
            title: "Buying & Selling",
            description: "How to trade AI models on the marketplace"
        },
        {
            icon: "fa-code",
            title: "Technical Support",
            description: "API documentation and integration guides"
        }
    ];

    return (
        <div className="pt-20 pb-12" data-name="help-center">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
                    <p className="text-gray-400">
                        Find answers to common questions and learn how to use JoyNet
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search for help..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white"
                        />
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {categories.map((category, index) => (
                        <div 
                            key={index}
                            className="glass-effect rounded-xl p-6 text-center hover:border-primary-main cursor-pointer"
                            data-name={`help-category-${index}`}
                        >
                            <i className={`fas ${category.icon} text-3xl text-primary-main mb-4`}></i>
                            <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                            <p className="text-gray-400 text-sm">{category.description}</p>
                        </div>
                    ))}
                </div>

                {/* FAQs */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index}
                                className="glass-effect rounded-xl p-6"
                                data-name={`faq-${index}`}
                            >
                                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                                <p className="text-gray-400">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Support */}
                <div className="max-w-3xl mx-auto mt-12 text-center">
                    <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                    <p className="text-gray-400 mb-6">
                        Our support team is available 24/7 to assist you
                    </p>
                    <button className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold">
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
}
