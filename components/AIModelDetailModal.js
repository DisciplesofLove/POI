function AIModelDetailModal({ model, onClose, onEdit }) {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-effect rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">{model.name}</h2>
                            <div className="flex items-center mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    model.deploymentStatus === 'active' 
                                        ? 'bg-success-main/20 text-success-light' 
                                        : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                    {model.deploymentStatus === 'active' ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-sm text-gray-400 ml-3">
                                    Last updated: {new Date(model.lastUpdated).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm text-gray-400 mb-1">Description</h3>
                                <p>{model.description}</p>
                            </div>
                            <div>
                                <h3 className="text-sm text-gray-400 mb-1">Type</h3>
                                <p>{model.type}</p>
                            </div>
                            <div>
                                <h3 className="text-sm text-gray-400 mb-1">Architecture</h3>
                                <p>{model.architecture}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm text-gray-400 mb-1">Parameters</h3>
                                <p>{model.parameters}</p>
                            </div>
                            <div>
                                <h3 className="text-sm text-gray-400 mb-1">Accuracy</h3>
                                <p>{model.accuracy ? `${model.accuracy}%` : 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm text-gray-400 mb-1">Training Status</h3>
                                <div className="flex items-center">
                                    <span className={`px-2 py-1 rounded-full text-xs mr-2 ${
                                        model.trainingStatus === 'completed' 
                                            ? 'bg-success-main/20 text-success-light' 
                                            : 'bg-warning-main/20 text-warning-light'
                                    }`}>
                                        {model.trainingStatus.charAt(0).toUpperCase() + model.trainingStatus.slice(1)}
                                    </span>
                                    {model.trainingStatus === 'training' && (
                                        <span>{model.trainingProgress}% Complete</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">API Endpoints</h3>
                        {model.endpoints.length > 0 ? (
                            <div className="bg-white/5 rounded-lg p-4">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-sm text-gray-400">
                                            <th className="pb-2">Type</th>
                                            <th className="pb-2">URL</th>
                                            <th className="pb-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {model.endpoints.map((endpoint, index) => (
                                            <tr key={index} className="border-t border-white/10">
                                                <td className="py-3">{endpoint.type}</td>
                                                <td className="py-3">
                                                    <span className="font-mono text-sm">{endpoint.url}</span>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        endpoint.status === 'online' 
                                                            ? 'bg-success-main/20 text-success-light' 
                                                            : 'bg-error-main/20 text-error-light'
                                                    }`}>
                                                        {endpoint.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-4">No endpoints configured</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Products Using This Model</h3>
                        {model.usedInProducts && model.usedInProducts.length > 0 ? (
                            <div className="bg-white/5 rounded-lg p-4">
                                <ul className="space-y-2">
                                    {model.usedInProducts.map(productId => (
                                        <li key={productId} className="flex items-center">
                                            <i className="fas fa-cube text-primary-light mr-2"></i>
                                            <span>Product ID: {productId}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-4">Not used in any products yet</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
                        <button 
                            className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg"
                            onClick={onClose}
                        >
                            Close
                        </button>
                        <button 
                            className="bg-primary-main hover:bg-primary-dark px-6 py-2 rounded-lg"
                            onClick={onEdit}
                        >
                            Edit Model
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
