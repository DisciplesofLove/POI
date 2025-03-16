function CreateStore() {
    const [formData, setFormData] = React.useState({
        name: '',
        description: '',
        categories: [],
        avatar: '',
        banner: '',
        social: {
            website: '',
            twitter: '',
            github: ''
        }
    });

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            
            await createStore({
                ...formData,
                createdAt: new Date().toISOString(),
                rating: 0,
                reviewCount: 0
            });
            
            // Redirect to store page after success
            window.location.href = '/store';
        } catch (error) {
            setError(error.message);
            reportError(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="pt-20 pb-12" data-name="create-store">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold mb-4">Create Your Store</h1>
                    <p className="text-gray-400 mb-8">
                        Set up your store to start selling AI models and services
                    </p>

                    <div className="glass-effect rounded-xl p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Store Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Categories */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Categories</h2>
                                <select
                                    multiple
                                    value={formData.categories}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        categories: Array.from(e.target.selectedOptions, option => option.value)
                                    })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                >
                                    <option value="ai-models">AI Models</option>
                                    <option value="datasets">Datasets</option>
                                    <option value="services">Services</option>
                                    <option value="training">Training</option>
                                    <option value="consulting">Consulting</option>
                                </select>
                            </div>

                            {/* Media */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Media</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Store Avatar</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFormData({...formData, avatar: e.target.files[0]})}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Banner Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFormData({...formData, banner: e.target.files[0]})}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Social Links</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Website</label>
                                        <input
                                            type="url"
                                            value={formData.social.website}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                social: {...formData.social, website: e.target.value}
                                            })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Twitter</label>
                                        <input
                                            type="url"
                                            value={formData.social.twitter}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                social: {...formData.social, twitter: e.target.value}
                                            })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">GitHub</label>
                                        <input
                                            type="url"
                                            value={formData.social.github}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                social: {...formData.social, github: e.target.value}
                                            })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-error-main/20 text-error-light px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded-lg font-semibold ${
                                    loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary-main hover:bg-primary-dark'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Creating Store...
                                    </span>
                                ) : 'Create Store'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
