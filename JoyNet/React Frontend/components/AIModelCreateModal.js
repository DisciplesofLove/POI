function AIModelCreateModal({ onClose }) {
    const [formData, setFormData] = React.useState({
        name: '',
        description: '',
        type: 'Language Model',
        architecture: 'Transformer',
        parameters: '',
        baseModel: '',
        trainingDataset: '',
        deploymentType: 'cloud',
        computeResources: 'standard',
        autoScaling: false,
        privateEndpoint: false,
        apiAccess: true,
        trainingMethod: 'finetuning',
        epochs: '10',
        batchSize: '32',
        learningRate: '0.001',
        optimizer: 'adam'
    });
    const [activeStep, setActiveStep] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const { success, error: showError } = useNotification();

    const steps = [
        { title: "Basic Info", description: "Model details" },
        { title: "Configuration", description: "Technical aspects" },
        { title: "Training", description: "Training setup" },
        { title: "Deployment", description: "Deployment options" }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleNext = () => {
        setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const handlePrevious = () => {
        setActiveStep(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            success("AI model creation initiated successfully");
            onClose();
        } catch (error) {
            showError("Failed to create AI model");
            reportError(error);
        } finally {
            setLoading(false);
        }
    };

    // Render step content based on active step
    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return <BasicInfoStep formData={formData} handleChange={handleChange} />;
            case 1:
                return <ConfigurationStep formData={formData} handleChange={handleChange} />;
            case 2:
                return <TrainingStep formData={formData} handleChange={handleChange} />;
            case 3:
                return <DeploymentStep formData={formData} handleChange={handleChange} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-effect rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">Create New AI Model</h2>
                            <p className="text-gray-400">Complete all steps to create your model</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    {/* Stepper */}
                    <div className="mb-6">
                        <div className="flex justify-between">
                            {steps.map((step, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        index < activeStep 
                                            ? 'bg-success-main text-white' 
                                            : index === activeStep
                                            ? 'bg-primary-main text-white'
                                            : 'bg-white/10 text-gray-400'
                                    }`}>
                                        {index < activeStep ? (
                                            <i className="fas fa-check"></i>
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    <div className="text-center mt-2">
                                        <div className={`text-xs font-semibold ${
                                            index <= activeStep ? 'text-white' : 'text-gray-400'
                                        }`}>
                                            {step.title}
                                        </div>
                                        <div className="text-xs text-gray-400 hidden md:block">
                                            {step.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="relative mt-4">
                            <div className="absolute top-0 left-4 right-4 h-1 bg-white/10"></div>
                            <div 
                                className="absolute top-0 left-4 h-1 bg-primary-main transition-all duration-300"
                                style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : handleNext}>
                        {/* Step Content */}
                        {renderStepContent()}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6 border-t border-white/10 mt-6">
                            <button
                                type="button"
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
                                onClick={activeStep === 0 ? onClose : handlePrevious}
                            >
                                {activeStep === 0 ? 'Cancel' : 'Previous'}
                            </button>
                            <button
                                type={activeStep === steps.length - 1 ? 'submit' : 'button'}
                                className="px-6 py-2 bg-primary-main hover:bg-primary-dark rounded-lg"
                                disabled={loading}
                                onClick={activeStep === steps.length - 1 ? undefined : handleNext}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Processing...
                                    </span>
                                ) : activeStep === steps.length - 1 ? 'Create Model' : 'Next'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Step 1: Basic Information
function BasicInfoStep({ formData, handleChange }) {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-2">Model Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    placeholder="e.g., TextGen-Pro"
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
                    placeholder="Describe your model's capabilities and use cases"
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
                    placeholder="e.g., 1.5B"
                />
                <p className="text-xs text-gray-400 mt-1">
                    Enter parameter count (e.g., "1.5B") or size information
                </p>
            </div>
        </div>
    );
}

// Step 2: Configuration
function ConfigurationStep({ formData, handleChange }) {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-2">Base Model</label>
                <select
                    name="baseModel"
                    value={formData.baseModel}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                >
                    <option value="">Select a base model</option>
                    <option value="gpt-neo">GPT-Neo</option>
                    <option value="llama">Llama</option>
                    <option value="stable-diffusion">Stable Diffusion</option>
                    <option value="whisper">Whisper</option>
                    <option value="custom">Custom Architecture</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                    Select a foundational model to build upon
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Training Method</label>
                    <select
                        name="trainingMethod"
                        value={formData.trainingMethod}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    >
                        <option value="finetuning">Fine-tuning</option>
                        <option value="pretraining">Pre-training</option>
                        <option value="transfer">Transfer Learning</option>
                        <option value="distillation">Knowledge Distillation</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-2">Training Dataset</label>
                    <input
                        type="text"
                        name="trainingDataset"
                        value={formData.trainingDataset}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        placeholder="Dataset ID or name"
                    />
                </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-medium mb-3">Advanced Configuration</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Enable Mixed Precision</span>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                name="mixedPrecision"
                                checked={formData.mixedPrecision}
                                onChange={handleChange}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Enable Quantization</span>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                name="quantization"
                                checked={formData.quantization}
                                onChange={handleChange}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Enable Distributed Training</span>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                name="distributedTraining"
                                checked={formData.distributedTraining}
                                onChange={handleChange}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Step 3: Training
function TrainingStep({ formData, handleChange }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Epochs</label>
                    <input
                        type="number"
                        name="epochs"
                        value={formData.epochs}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        min="1"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-2">Batch Size</label>
                    <input
                        type="number"
                        name="batchSize"
                        value={formData.batchSize}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        min="1"
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Learning Rate</label>
                    <input
                        type="text"
                        name="learningRate"
                        value={formData.learningRate}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        placeholder="e.g., 0.001"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-2">Optimizer</label>
                    <select
                        name="optimizer"
                        value={formData.optimizer}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    >
                        <option value="adam">Adam</option>
                        <option value="sgd">SGD</option>
                        <option value="rmsprop">RMSprop</option>
                        <option value="adagrad">Adagrad</option>
                    </select>
                </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-medium mb-3">Training Resources</h3>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Compute Resources</label>
                    <select
                        name="computeResources"
                        value={formData.computeResources}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    >
                        <option value="standard">Standard (4 vCPUs, 16GB RAM)</option>
                        <option value="high">High Performance (8 vCPUs, 32GB RAM)</option>
                        <option value="gpu-small">GPU - Small (1 GPU, 16GB VRAM)</option>
                        <option value="gpu-large">GPU - Large (4 GPUs, 64GB VRAM)</option>
                    </select>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm">Enable Checkpointing</span>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            name="checkpointing"
                            checked={formData.checkpointing}
                            onChange={handleChange}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>
            
            <div className="bg-primary-main/20 border border-primary-main/30 rounded-lg p-4">
                <div className="flex items-start">
                    <i className="fas fa-info-circle text-primary-light mt-1 mr-3"></i>
                    <div>
                        <h4 className="font-medium text-primary-light">Training Cost Estimate</h4>
                        <p className="text-sm mt-1">
                            Based on your configuration, estimated training cost: <span className="font-semibold">250 JOY tokens</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Step 4: Deployment
function DeploymentStep({ formData, handleChange }) {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-2">Deployment Type</label>
                <select
                    name="deploymentType"
                    value={formData.deploymentType}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                >
                    <option value="cloud">Cloud Deployment</option>
                    <option value="edge">Edge Deployment</option>
                    <option value="hybrid">Hybrid Deployment</option>
                    <option value="download">Download Only (No Deployment)</option>
                </select>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 space-y-4">
                <h3 className="font-medium mb-2">Deployment Options</h3>
                
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium">Auto-scaling</span>
                        <p className="text-xs text-gray-400">Automatically scale resources based on demand</p>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            name="autoScaling"
                            checked={formData.autoScaling}
                            onChange={handleChange}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
                
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium">Private Endpoint</span>
                        <p className="text-xs text-gray-400">Deploy with a private network endpoint</p>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            name="privateEndpoint"
                            checked={formData.privateEndpoint}
                            onChange={handleChange}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
                
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium">API Access</span>
                        <p className="text-xs text-gray-400">Enable API access to your model</p>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            name="apiAccess"
                            checked={formData.apiAccess}
                            onChange={handleChange}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
                <h3 className="font-medium mb-3">Access Control</h3>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Access Level</label>
                    <select
                        name="accessLevel"
                        value={formData.accessLevel}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                    >
                        <option value="public">Public (Anyone can access)</option>
                        <option value="token">Token-gated (JOY token holders)</option>
                        <option value="private">Private (Only you)</option>
                        <option value="custom">Custom Access List</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-2">Rate Limiting (requests/minute)</label>
                    <input
                        type="number"
                        name="rateLimit"
                        value={formData.rateLimit}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        placeholder="e.g., 60"
                    />
                </div>
            </div>
            
            <div className="bg-primary-main/20 border border-primary-main/30 rounded-lg p-4">
                <div className="flex items-start">
                    <i className="fas fa-info-circle text-primary-light mt-1 mr-3"></i>
                    <div>
                        <h4 className="font-medium text-primary-light">Deployment Cost Estimate</h4>
                        <p className="text-sm mt-1">
                            Estimated monthly cost: <span className="font-semibold">50 JOY tokens</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
