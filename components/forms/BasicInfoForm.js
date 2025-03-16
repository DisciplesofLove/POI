function BasicInfoForm({ modelData, handleChange, handleArrayInput }) {
    return (
        <div className="glass-effect rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Model Name</label>
                    <input
                        type="text"
                        name="name"
                        value={modelData.name}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        placeholder="e.g., TextGen Pro"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                        name="category"
                        value={modelData.category}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        required
                    >
                        <option value="text-generation">Text Generation</option>
                        <option value="image-generation">Image Generation</option>
                        <option value="audio-processing">Audio Processing</option>
                        <option value="video-processing">Video Processing</option>
                        <option value="data-analysis">Data Analysis</option>
                        <option value="natural-language">Natural Language</option>
                    </select>
                </div>
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Short Description</label>
                <input
                    type="text"
                    name="shortDescription"
                    value={modelData.shortDescription}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    placeholder="Brief overview of your model (max 160 characters)"
                    maxLength={160}
                />
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Full Description</label>
                <textarea
                    name="description"
                    value={modelData.description}
                    onChange={handleChange}
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    placeholder="Detailed description of your model's capabilities and features..."
                    required
                ></textarea>
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Purpose</label>
                <textarea
                    name="purpose"
                    value={modelData.purpose}
                    onChange={handleChange}
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    placeholder="What problems does your model solve? What are its main use cases?"
                ></textarea>
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Target Audience (comma-separated)</label>
                <input
                    type="text"
                    value={modelData.targetAudience.join(', ')}
                    onChange={(e) => handleArrayInput(e, 'targetAudience')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    placeholder="e.g., Developers, Data Scientists, Content Creators"
                />
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                    type="text"
                    value={modelData.tags.join(', ')}
                    onChange={(e) => handleArrayInput(e, 'tags')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    placeholder="e.g., NLP, Machine Learning, Computer Vision"
                />
            </div>
        </div>
    );
}
