function APIReferencePage() {
    const endpoints = [
        {
            method: "GET",
            path: "/api/v1/models",
            description: "List all AI models",
            parameters: [
                { name: "page", type: "number", description: "Page number for pagination" },
                { name: "limit", type: "number", description: "Number of items per page" },
                { name: "category", type: "string", description: "Filter by category" }
            ],
            response: `{
  "data": [
    {
      "id": "model_123",
      "name": "GPT Model",
      "description": "Advanced language model"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}`
        },
        {
            method: "POST",
            path: "/api/v1/models",
            description: "Create a new AI model",
            parameters: [
                { name: "name", type: "string", description: "Model name" },
                { name: "description", type: "string", description: "Model description" },
                { name: "price", type: "number", description: "Model price in MATIC" }
            ],
            response: `{
  "id": "model_123",
  "name": "New Model",
  "status": "created"
}`
        }
    ];

    return (
        <div className="pt-20 pb-12" data-name="api-reference">
            <div className="container mx-auto px-4">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">API Reference</h1>
                    <p className="text-gray-400">
                        Complete documentation for the JoyNet API. Learn how to integrate AI models into your applications.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass-effect rounded-xl p-6">
                        <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#authentication" className="text-primary-main hover:text-primary-light">
                                    Authentication
                                </a>
                            </li>
                            <li>
                                <a href="#errors" className="text-primary-main hover:text-primary-light">
                                    Error Handling
                                </a>
                            </li>
                            <li>
                                <a href="#rate-limits" className="text-primary-main hover:text-primary-light">
                                    Rate Limits
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="glass-effect rounded-xl p-6">
                        <h3 className="text-xl font-semibold mb-4">API Keys</h3>
                        <p className="text-gray-400 mb-4">
                            Generate and manage your API keys in the dashboard
                        </p>
                        <button className="bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg">
                            Get API Key
                        </button>
                    </div>
                    <div className="glass-effect rounded-xl p-6">
                        <h3 className="text-xl font-semibold mb-4">SDKs & Libraries</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center">
                                <i className="fab fa-python mr-2"></i>
                                <span>Python SDK</span>
                            </li>
                            <li className="flex items-center">
                                <i className="fab fa-js mr-2"></i>
                                <span>JavaScript SDK</span>
                            </li>
                            <li className="flex items-center">
                                <i className="fab fa-java mr-2"></i>
                                <span>Java SDK</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Endpoints */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold mb-6">Endpoints</h2>
                    {endpoints.map((endpoint, index) => (
                        <div key={index} className="glass-effect rounded-xl p-6" data-name={`endpoint-${index}`}>
                            <div className="flex items-center mb-4">
                                <span className={`
                                    px-3 py-1 rounded-lg mr-4 font-mono
                                    ${endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' : ''}
                                    ${endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' : ''}
                                    ${endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                                    ${endpoint.method === 'DELETE' ? 'bg-red-500/20 text-red-400' : ''}
                                `}>
                                    {endpoint.method}
                                </span>
                                <code className="font-mono text-gray-300">{endpoint.path}</code>
                            </div>
                            <p className="text-gray-400 mb-4">{endpoint.description}</p>
                            
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Parameters</h4>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-sm">
                                                <th className="pb-2">Name</th>
                                                <th className="pb-2">Type</th>
                                                <th className="pb-2">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-gray-400">
                                            {endpoint.parameters.map((param, paramIndex) => (
                                                <tr key={paramIndex}>
                                                    <td className="py-2 font-mono">{param.name}</td>
                                                    <td className="py-2">{param.type}</td>
                                                    <td className="py-2">{param.description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">Example Response</h4>
                                <pre className="bg-white/5 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                    {endpoint.response}
                                </pre>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
