function ContactPage() {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);
    const { success, error: showError } = useNotification();

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            // In a real app, this would send the form data to an API
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
            
            success('Message sent successfully! We will get back to you soon.');
            setSubmitted(true);
            
            // Reset form
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            showError('Failed to send message. Please try again later.');
            reportError(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="pt-20 pb-12" data-name="contact-page">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold mb-4 text-center">Contact Us</h1>
                    <p className="text-gray-400 text-center mb-12">
                        Have questions or feedback? We'd love to hear from you.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="glass-effect rounded-xl p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary-main/20 flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-envelope text-primary-light text-xl"></i>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Email</h3>
                            <p className="text-gray-400">support@joynet.ai</p>
                        </div>
                        
                        <div className="glass-effect rounded-xl p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary-main/20 flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-comments text-primary-light text-xl"></i>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Discord</h3>
                            <p className="text-gray-400">Join our Discord community</p>
                        </div>
                        
                        <div className="glass-effect rounded-xl p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary-main/20 flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-map-marker-alt text-primary-light text-xl"></i>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Location</h3>
                            <p className="text-gray-400">Decentralized globally</p>
                        </div>
                    </div>

                    <div className="glass-effect rounded-xl p-8">
                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="space-y-6" data-name="contact-form">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-2">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-2">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                        required
                                    ></textarea>
                                </div>
                                
                                <div className="flex justify-center">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`
                                            px-8 py-3 rounded-lg font-semibold w-full md:w-auto
                                            ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary-main hover:bg-primary-dark'}
                                        `}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center">
                                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                                Sending...
                                            </span>
                                        ) : 'Send Message'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 rounded-full bg-success-main/20 flex items-center justify-center mx-auto mb-4">
                                    <i className="fas fa-check text-success-light text-2xl"></i>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                                <p className="text-gray-300 mb-6">
                                    Your message has been sent successfully. We'll get back to you as soon as possible.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="bg-primary-main hover:bg-primary-dark px-6 py-2 rounded-lg"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-16 glass-effect rounded-xl p-6">
                        <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
                        
                        <div className="space-y-4">
                            <div className="bg-white/5 rounded-lg p-4">
                                <h3 className="font-semibold mb-2">How do I connect my wallet?</h3>
                                <p className="text-gray-400">
                                    Click the "Connect Wallet" button in the top right corner and follow the prompts from your wallet provider.
                                </p>
                            </div>
                            
                            <div className="bg-white/5 rounded-lg p-4">
                                <h3 className="font-semibold mb-2">What blockchains are supported?</h3>
                                <p className="text-gray-400">
                                    JoyNet currently supports Polygon and Ethereum networks, with more blockchain integrations coming soon.
                                </p>
                            </div>
                            
                            <div className="bg-white/5 rounded-lg p-4">
                                <h3 className="font-semibold mb-2">How do I list my AI model?</h3>
                                <p className="text-gray-400">
                                    You need to create a store first, then you can list your AI model as an NFT through our Create Store section.
                                </p>
                            </div>
                            
                            <div className="bg-white/5 rounded-lg p-4">
                                <h3 className="font-semibold mb-2">What are JOY tokens used for?</h3>
                                <p className="text-gray-400">
                                    JOY tokens are the native utility token of the JoyNet platform, used for governance, staking, and marketplace transactions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
