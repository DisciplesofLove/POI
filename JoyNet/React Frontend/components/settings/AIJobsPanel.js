function AIJobsPanel({ userAddress }) {
    const [loading, setLoading] = React.useState(false);
    const [aiJobSettings, setAiJobSettings] = React.useState({
        participateInPoI: false,
        participateInPoU: false,
        offerValidation: false,
        offerGovernance: false,
        offerTraining: false,
        computeResources: 'none',
        availableStorage: '0'
    });
    const { success, error: showError } = useNotification();

    async function handleAiJobSettingsSubmit(e) {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            // In a real app, you would update AI job settings in the API
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            success('AI job settings updated successfully');
        } catch (error) {
            showError('Failed to update AI job settings');
            reportError(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div data-name="ai-jobs-settings">
            <h2 className="text-2xl font-semibold mb-6">AI Jobs Settings</h2>
            
            <form onSubmit={handleAiJobSettingsSubmit}>
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Participation Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Proof of Inference (PoI)</h4>
                                <p className="text-sm text-gray-400">Participate in validating AI model inferences</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={aiJobSettings.participateInPoI}
                                    onChange={() => setAiJobSettings({
                                        ...aiJobSettings,
                                        participateInPoI: !aiJobSettings.participateInPoI
                                    })}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Proof of Use (PoU)</h4>
                                <p className="text-sm text-gray-400">Participate in validating AI model usage</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={aiJobSettings.participateInPoU}
                                    onChange={() => setAiJobSettings({
                                        ...aiJobSettings,
                                        participateInPoU: !aiJobSettings.participateInPoU
                                    })}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-white/10 pt-6 mb-8">
                    <h3 className="text-lg font-semibold mb-4">Job Offerings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Validation Jobs</h4>
                                <p className="text-sm text-gray-400">Offer computational resources for model validation</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={aiJobSettings.offerValidation}
                                    onChange={() => setAiJobSettings({
                                        ...aiJobSettings,
                                        offerValidation: !aiJobSettings.offerValidation
                                    })}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Governance Jobs</h4>
                                <p className="text-sm text-gray-400">Offer computational resources for governance processes</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={aiJobSettings.offerGovernance}
                                    onChange={() => setAiJobSettings({
                                        ...aiJobSettings,
                                        offerGovernance: !aiJobSettings.offerGovernance
                                    })}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Training Jobs</h4>
                                <p className="text-sm text-gray-400">Offer computational resources for model training</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={aiJobSettings.offerTraining}
                                    onChange={() => setAiJobSettings({
                                        ...aiJobSettings,
                                        offerTraining: !aiJobSettings.offerTraining
                                    })}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-white/10 pt-6 mb-8">
                    <h3 className="text-lg font-semibold mb-4">Resource Settings</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Compute Resources</label>
                            <select
                                value={aiJobSettings.computeResources}
                                onChange={(e) => setAiJobSettings({...aiJobSettings, computeResources: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            >
                                <option value="none">None</option>
                                <option value="low">Low (1-2 CPU cores)</option>
                                <option value="medium">Medium (3-4 CPU cores)</option>
                                <option value="high">High (5+ CPU cores)</option>
                                <option value="gpu">GPU Available</option>
                            </select>
                            <p className="text-sm text-gray-400 mt-1">
                                Select the computational resources you want to contribute
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Available Storage (GB)</label>
                            <input
                                type="number"
                                value={aiJobSettings.availableStorage}
                                onChange={(e) => setAiJobSettings({...aiJobSettings, availableStorage: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                min="0"
                            />
                            <p className="text-sm text-gray-400 mt-1">
                                Enter the amount of storage space you want to contribute
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-white/10 pt-6">
                    <div className="bg-white/5 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold mb-2">Rewards Estimate</h4>
                        <p className="text-gray-400">
                            Based on your settings, you could earn approximately:
                        </p>
                        <div className="mt-2">
                            <span className="text-xl font-bold text-success-light">0.5 - 2.5 JOY</span>
                            <span className="text-gray-400 ml-2">tokens per day</span>
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        className={`
                            px-8 py-3 rounded-lg font-semibold
                            ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary-main hover:bg-primary-dark'}
                        `}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Saving...
                            </span>
                        ) : 'Save AI Job Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
