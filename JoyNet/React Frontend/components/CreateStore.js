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

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setLoading(true);
            await createStore({
                ...formData,
                createdAt: new Date().toISOString(),
                rating: 0,
                reviewCount: 0
            });
            // Redirect to store page
        } catch (error) {
            reportError(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto px-4 py-8" data-name="create-store">
            <div className="max-w-2xl mx-auto glass-effect rounded-xl p-8">
                <h2 className="text-3xl font-bold mb-8">Create Your Store</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Store Name</label>
                        <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Categories</label>
                        <select
                            multiple
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            value={formData.categories}
                            onChange={(e) => setFormData({
                                ...formData, 
                                categories: Array.from(e.target.selectedOptions, option => option.value)
                            })}
                        >
                            <option value="models">AI Models</option>
                            <option value="datasets">Datasets</option>
                            <option value="training">Training Services</option>
                            <option value="algorithms">Algorithms</option>
                            <option value="consulting">AI Consulting</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Store Avatar URL</label>
                        <input
                            type="url"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            value={formData.avatar}
                            onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Banner Image URL</label>
                        <input
                            type="url"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            value={formData.banner}
                            onChange={(e) => setFormData({...formData, banner: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Website</label>
                        <input
                            type="url"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            value={formData.social.website}
                            onChange={(e) => setFormData({
                                ...formData, 
                                social: {...formData.social, website: e.target.value}
                            })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Twitter</label>
                        <input
                            type="url"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            value={formData.social.twitter}
                            onChange={(e) => setFormData({
                                ...formData, 
                                social: {...formData.social, twitter: e.target.value}
                            })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">GitHub</label>
                        <input
                            type="url"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            value={formData.social.github}
                            onChange={(e) => setFormData({
                                ...formData, 
                                social: {...formData.social, github: e.target.value}
                            })}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold ${
                            loading ? 'bg-gray-600' : 'bg-primary-main hover:bg-primary-dark'
                        }`}
                    >
                        {loading ? 'Creating Store...' : 'Create Store'}
                    </button>
                </form>
            </div>
        </div>
    );
}
