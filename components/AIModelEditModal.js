function AIModelEditModal({ model, onClose }) {
    const [formData, setFormData] = React.useState({
        name: model.name,
        description: model.description,
        type: model.type,
        architecture: model.architecture,
        parameters: model.parameters,
        deploymentStatus: model.deploymentStatus
    });
    const [loading, setLoading] = React.useState(false);
    const { success, error: showError } = useNotification();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            success("AI model updated successfully");
            onClose();
        } catch (error) {
            showError("Failed to update AI model");
            reportError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-effect rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-2xl font-bold">Edit AI Model</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Model Name</label>
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
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                required
                            ></textarea>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                >
                                    <option value="Language Model">Language Model</option>
                                    <option value="Vision Model">Vision Model</option>
                                    <option value="Audio Model">Audio Model</option>
                                    <option value="Analysis Model">Analysis Model</option>
                                    <option value="Multimodal">Multimodal</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Architecture</label>
                                <select
                                    name="architecture"
                                    value={formData.architecture}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                >
                                    <option value="Transformer">Transformer</option>
                                    <option value="Diffusion">Diffusion</option>
                                    <option value="Ensemble">Ensemble</option>
                                    <option value="Hybrid Transformer">Hybrid Transformer</option>
                                    <option value="CNN">CNN</option>
                                    <option value="RNN">RNN</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Parameters</label>
                            <input
                                type="text"
                                name="parameters"
                                value={formData.parameters}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Enter parameter count (e.g., "1.5B") or size information
                            </p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Deployment Status</label>
                            <select
                                name="deploymentStatus"
                                value={formData.deploymentStatus}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="development">Development</option>
                            </select>
                        </div>

                        <div className="pt-4 border-t border-white/10 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary-main hover:bg-primary-dark rounded-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Saving...
                                    </span>
                                ) : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
