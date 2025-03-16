function Newsletter() {
    const [email, setEmail] = React.useState('');
    const [status, setStatus] = React.useState({ type: '', message: '' });

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setStatus({ type: 'loading', message: 'Subscribing...' });
            // Add your newsletter subscription logic here
            setStatus({ type: 'success', message: 'Successfully subscribed!' });
            setEmail('');
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to subscribe. Please try again.' });
            reportError(error);
        }
    }

    return (
        <section className="py-20 bg-gradient-to-br from-primary-dark/20 to-secondary-dark/20" data-name="newsletter">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
                    <p className="text-gray-400 mb-8">
                        Subscribe to our newsletter for the latest updates on AI models, 
                        market trends, and platform features.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold"
                            disabled={status.type === 'loading'}
                        >
                            {status.type === 'loading' ? (
                                <span className="flex items-center justify-center">
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Subscribing...
                                </span>
                            ) : 'Subscribe'}
                        </button>
                    </form>
                    
                    {status.message && (
                        <p className={`mt-4 ${
                            status.type === 'success' ? 'text-success-main' : 'text-error-main'
                        }`}>
                            {status.message}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
