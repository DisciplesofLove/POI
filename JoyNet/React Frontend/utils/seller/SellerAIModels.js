function SellerAIModels({ aiModels }) {
    try {
        const [selectedModel, setSelectedModel] = React.useState(null);
        const [isEditing, setIsEditing] = React.useState(false);
        const [isCreating, setIsCreating] = React.useState(false);
        const [deploymentStatus, setDeploymentStatus] = React.useState({});
        const { success, error: showError } = useNotification();

        // Handle model selection
        const handleViewModel = (model) => {
            setSelectedModel(model);
            setIsEditing(false);
        };

        // Handle edit mode
        const handleEditModel = (model) => {
            setSelectedModel(model);
            setIsEditing(true);
        };

        // Handle modal close
        const handleCloseModal = () => {
            setSelectedModel(null);
            setIsEditing(false);
            setIsCreating(false);
        };

        // Handle model deployment status changes
        const handleToggleDeployment = async (modelId, currentStatus) => {
            try {
                setDeploymentStatus(prev => ({
                    ...prev,
                    [modelId]: 'processing'
                }));

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 2000));

                const newStatus = currentStatus === 'active' ? 'paused' : 'active';
                
                // Update local state
                setDeploymentStatus(prev => ({
                    ...prev,
                    [modelId]: newStatus
                }));

                success(`Model ${currentStatus === 'active' ? 'paused' : 'activated'} successfully`);
            } catch (err) {
                showError('Failed to update deployment status');
                reportError(err);
                
                // Reset status on error
                setDeploymentStatus(prev => ({
                    ...prev,
                    [modelId]: currentStatus
                }));
            }
        };

        // Get deployment status for a model
        const getModelDeploymentStatus = (modelId) => {
            return deploymentStatus[modelId] || 
                aiModels.find(model => model.id === modelId)?.deploymentStatus || 
                'inactive';
        };

        return (
            <div data-name="seller-ai-models">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">AI Models</h2>
                    <button 
                        className="bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg flex items-center"
                        onClick={() => setIsCreating(true)}
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Create New Model
                    </button>
                </div>

                {/* Models Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {aiModels.map(model => (
                        <AIModelCard 
                            key={model.id}
                            model={model}
                            deploymentStatus={getModelDeploymentStatus(model.id)}
                            onView={() => handleViewModel(model)}
                            onEdit={() => handleEditModel(model)}
                            onToggleDeployment={() => handleToggleDeployment(
                                model.id, 
                                getModelDeploymentStatus(model.id)
                            )}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {aiModels.length === 0 && (
                    <div className="glass-effect rounded-xl p-8 text-center">
                        <div className="text-5xl text-gray-500 mb-4">
                            <i className="fas fa-robot"></i>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No AI Models Yet</h3>
                        <p className="text-gray-400 mb-6">
                            Create your first AI model to get started.
                        </p>
                        <button 
                            className="bg-primary-main hover:bg-primary-dark px-6 py-3 rounded-lg"
                            onClick={() => setIsCreating(true)}
                        >
                            Create New Model
                        </button>
                    </div>
                )}

                {/* Model Detail Modal */}
                {selectedModel && !isEditing && (
                    <AIModelDetailModal 
                        model={selectedModel} 
                        onClose={handleCloseModal}
                        onEdit={() => setIsEditing(true)}
                    />
                )}

                {/* Model Edit Modal */}
                {selectedModel && isEditing && (
                    <AIModelEditModal 
                        model={selectedModel} 
                        onClose={handleCloseModal}
                    />
                )}

                {/* Create New Model Modal */}
                {isCreating && (
                    <AIModelCreateModal onClose={handleCloseModal} />
                )}
            </div>
        );
    } catch (error) {
        console.error("SellerAIModels render error:", error);
        reportError(error);
        return (
            <div className="glass-effect rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">AI Models</h2>
                <p className="text-gray-400">There was an error loading the AI models data.</p>
            </div>
        );
    }
}
