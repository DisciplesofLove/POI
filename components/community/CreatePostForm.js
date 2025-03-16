function CreatePostForm({ onSubmit, categories }) {
    const [formData, setFormData] = React.useState({
        title: '',
        content: '',
        category: '',
        tags: '',
        image: null
    });
    const [loading, setLoading] = React.useState(false);
    const [imagePreview, setImagePreview] = React.useState(null);
    const { currentUser } = useAuth();
    const { error: showError } = useNotification();

    // AI suggestion feature
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [suggestions, setSuggestions] = React.useState({
        title: '',
        content: '',
        tags: []
    });
    const [generatingSuggestions, setGeneratingSuggestions] = React.useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setFormData({ ...formData, image: null });
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
            showError('Please fill in all required fields');
            return;
        }
        
        try {
            setLoading(true);
            
            const tagsArray = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
            
            await onSubmit({
                ...formData,
                tags: tagsArray
            });
            
            // Reset form
            setFormData({
                title: '',
                content: '',
                category: '',
                tags: '',
                image: null
            });
            setImagePreview(null);
            
        } catch (error) {
            showError('Failed to create post');
            reportError(error);
        } finally {
            setLoading(false);
        }
    };

    const generateSuggestions = async () => {
        if (!formData.content.trim() || formData.content.length < 20) {
            showError('Please write some content first (at least 20 characters)');
            return;
        }

        try {
            setGeneratingSuggestions(true);
            const response = await invokeAIAgent(
                `You are a helpful AI assistant for a blockchain-based AI model marketplace community forum.
                
                Based on the following post content, suggest:
                1. An improved, more engaging title (keep it concise)
                2. 3-5 relevant tags (single words or short phrases)
                
                Format your response as JSON:
                {
                    "title": "Suggested title here",
                    "tags": ["tag1", "tag2", "tag3"]
                }
                
                Do not include any other text, explanations, or markdown formatting in your response.`,
                formData.content
            );

            try {
                // Clean up response to ensure it's valid JSON
                const cleanResponse = response.replace(/json|/g, '').trim();
                const parsedResponse = JSON.parse(cleanResponse);
                
                setSuggestions({
                    title: parsedResponse.title || '',
                    tags: parsedResponse.tags || []
                });
                setShowSuggestions(true);
            } catch (jsonError) {
                console.error("Failed to parse AI response:", jsonError);
                reportError(jsonError);
                showError('Failed to generate suggestions');
            }
        } catch (error) {
            console.error("AI suggestion error:", error);
            reportError(error);
            showError('Failed to generate suggestions');
        } finally {
            setGeneratingSuggestions(false);
        }
    };

    const applySuggestions = () => {
        setFormData({
            ...formData,
            title: suggestions.title,
            tags: suggestions.tags.join(', ')
        });
        setShowSuggestions(false);
    };

    if (!currentUser) {
        return (
            <div className="glass-effect rounded-xl p-6 text-center" data-name="login-prompt">
                <h3 className="text-xl font-semibold mb-4">Join the Conversation</h3>
                <p className="text-gray-400 mb-4">You need to be logged in to create a post.</p>
                <Button 
                    variant="primary"
                    onClick={() => window.location.href = '/login'}
                >
                    Log In
                </Button>
            </div>
        );
    }

    return (
        <div className="glass-effect rounded-xl p-6" data-name="create-post-form">
            <h2 className="text-2xl font-semibold mb-6">Create New Post</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        placeholder="Enter a descriptive title"
                        required
                    />
                </div>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">Content *</label>
                        <button
                            type="button"
                            onClick={generateSuggestions}
                            disabled={generatingSuggestions || !formData.content.trim() || formData.content.length < 20}
                            className={`text-sm flex items-center ${
                                generatingSuggestions || !formData.content.trim() || formData.content.length < 20
                                    ? 'text-gray-500 cursor-not-allowed'
                                    : 'text-primary-light hover:text-primary-main'
                            }`}
                        >
                            {generatingSuggestions ? (
                                <div className="flex items-center">
                                    <i className="fas fa-spinner fa-spin mr-1"></i>
                                    <span>Generating...</span>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <i className="fas fa-magic mr-1"></i>
                                    <span>AI Suggestions</span>
                                </div>
                            )}
                        </button>
                    </div>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white min-h-[200px]"
                        placeholder="Write your post content here..."
                        required
                    ></textarea>
                </div>
                
                {showSuggestions && (
                    <div className="mb-6 bg-primary-dark/20 border border-primary-main/30 rounded-lg p-4" data-name="ai-suggestions">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-primary-light flex items-center">
                                <i className="fas fa-lightbulb mr-2"></i>
                                AI Suggestions
                            </h3>
                            <button 
                                type="button" 
                                onClick={() => setShowSuggestions(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <h4 className="text-sm font-medium mb-1">Suggested Title</h4>
                                <div className="bg-white/5 p-2 rounded-lg text-gray-100">
                                    {suggestions.title}
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-medium mb-1">Suggested Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.tags.map((tag, index) => (
                                        <span 
                                            key={index}
                                            className="bg-white/5 px-2 py-1 rounded-full text-xs text-gray-100"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <button
                            type="button"
                            onClick={applySuggestions}
                            className="mt-4 bg-primary-main/50 hover:bg-primary-main/70 px-4 py-2 rounded-lg text-sm w-full"
                        >
                            Apply Suggestions
                        </button>
                    </div>
                )}
                
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        placeholder="Enter tags separated by commas (e.g. AI, blockchain, development)"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Tags help others find your post. Add up to 5 relevant tags.
                    </p>
                </div>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Image (Optional)</label>
                    {imagePreview ? (
                        <div className="relative">
                            <img 
                                src={imagePreview} 
                                alt="Post preview" 
                                className="max-h-64 rounded-lg object-contain bg-white/5 p-2 w-full"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 bg-error-main/80 hover:bg-error-main text-white p-1 rounded-full"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-6">
                            <label className="flex flex-col items-center cursor-pointer">
                                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                <span className="text-gray-400 mb-2">Click to upload an image</span>
                                <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageChange} 
                                    className="hidden" 
                                />
                            </label>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => onSubmit(null)} // Cancel action
                        className="px-6 py-2 border border-white/10 rounded-lg hover:bg-white/5"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`
                            px-6 py-2 rounded-lg font-semibold
                            ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary-main hover:bg-primary-dark'}
                        `}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Creating...
                            </span>
                        ) : 'Create Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}
