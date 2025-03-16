function TechnicalDetailsForm({ modelData, handleChange, handlePerformanceMetricChange }) {
    return (
        <div className="glass-effect rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Technical Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Architecture</label>
                    <input
                        type="text"
                        name="architecture"
                        value={modelData.architecture}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        placeholder="e.g., Transformer, CNN, RNN"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-2">Parameters</label>
                    <input
                        type="text"
                        name="parameters"
                        value={modelData.parameters}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        placeholder="e.g., 1.5B"
                    />
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Accuracy (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={modelData.performanceMetrics.accuracy}
                            onChange={(e) => handlePerformanceMetricChange('accuracy', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Speed (ms)</label>
                        <input
                            type="number"
                            min="0"
                            value={modelData.performanceMetrics.speed}
                            onChange={(e) => handlePerformanceMetricChange('speed', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Efficiency Score</label>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={modelData.performanceMetrics.efficiency}
                            onChange={(e) => handlePerformanceMetricChange('efficiency', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
