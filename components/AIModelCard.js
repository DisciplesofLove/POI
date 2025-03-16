function AIModelCard({ model, deploymentStatus, onView, onEdit, onToggleDeployment }) {
    // Format parameters to be more readable
    const formatParameters = (params) => {
        if (!params) return 'N/A';
        
        // If it's already a string, return as is
        if (typeof params === 'string') return params;
        
        // If it's a number, format with commas
        if (typeof params === 'number') {
            return params.toLocaleString();
        }
        
        return JSON.stringify(params);
    };

    const isProcessing = deploymentStatus === 'processing';

    return (
        <div 
            className="glass-effect rounded-xl p-6 flex flex-col"
            data-name={`ai-model-${model.id}`}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{model.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${
                    deploymentStatus === 'active' 
                        ? 'bg-success-main/20 text-success-light' 
                        : deploymentStatus === 'processing'
                        ? 'bg-warning-main/20 text-warning-light'
                        : 'bg-gray-500/20 text-gray-400'
                }`}>
                    {deploymentStatus === 'processing' 
                        ? 'Processing...' 
                        : deploymentStatus.charAt(0).toUpperCase() + 
                          deploymentStatus.slice(1)}
                </span>
            </div>

            <p className="text-gray-400 text-sm mb-4">{model.description}</p>

            <div className="space-y-2 mb-4 flex-grow">
                <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Type:</span>
                    <span className="text-sm">{model.type}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Architecture:</span>
                    <span className="text-sm">{model.architecture}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Parameters:</span>
                    <span className="text-sm">{formatParameters(model.parameters)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Accuracy:</span>
                    <span className="text-sm">{model.accuracy ? `${model.accuracy}%` : 'N/A'}</span>
                </div>
                {model.trainingStatus === 'training' && (
                    <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                            <span>Training Progress</span>
                            <span>{model.trainingProgress}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                            <div 
                                className="bg-primary-main h-2 rounded-full" 
                                style={{ width: `${model.trainingProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div className="space-x-2">
                    <button 
                        className="p-2 hover:bg-white/10 rounded-lg"
                        onClick={onView}
                    >
                        <i className="fas fa-eye"></i>
                    </button>
                    <button 
                        className="p-2 hover:bg-white/10 rounded-lg"
                        onClick={onEdit}
                    >
                        <i className="fas fa-edit"></i>
                    </button>
                </div>
                <button 
                    className={`px-3 py-1 rounded-lg text-sm ${
                        isProcessing
                            ? 'bg-gray-600 cursor-not-allowed'
                            : deploymentStatus === 'active'
                            ? 'bg-error-main/20 text-error-light hover:bg-error-main/40'
                            : 'bg-success-main/20 text-success-light hover:bg-success-main/40'
                    }`}
                    onClick={onToggleDeployment}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <span className="flex items-center">
                            <i className="fas fa-spinner fa-spin mr-1"></i>
                            Processing...
                        </span>
                    ) : deploymentStatus === 'active' ? (
                        'Pause Deployment'
                    ) : (
                        'Activate'
                    )}
                </button>
            </div>
        </div>
    );
}
