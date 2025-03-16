function APIKeysPanel() {
    const { success, error: showError } = useNotification();
    const [loading, setLoading] = React.useState(false);
    const [apiKeys, setApiKeys] = React.useState([
        {
            id: 'key-1',
            name: 'Development Key',
            key: 'jn_dev_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            created: '2023-08-15T10:30:00Z',
            lastUsed: '2023-09-05T15:45:00Z',
            permissions: ['read', 'write'],
            active: true
        },
        {
            id: 'key-2',
            name: 'Production Key',
            key: 'jn_prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            created: '2023-07-22T09:15:00Z',
            lastUsed: '2023-09-10T08:20:00Z',
            permissions: ['read'],
            active: true
        }
    ]);
    const [newKeyName, setNewKeyName] = React.useState('');
    const [newKeyPermissions, setNewKeyPermissions] = React.useState(['read']);
    const [showCreateForm, setShowCreateForm] = React.useState(false);

    function handlePermissionChange(permission) {
        if (newKeyPermissions.includes(permission)) {
            setNewKeyPermissions(newKeyPermissions.filter(p => p !== permission));
        } else {
            setNewKeyPermissions([...newKeyPermissions, permission]);
        }
    }

    async function handleCreateKey(e) {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            // In a real app, this would call an API to create a new key
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            
            const newKey = {
                id: `key-${apiKeys.length + 1}`,
                name: newKeyName,
                key: `jn_${Math.random().toString(36).substring(2, 10)}_xxxxxxxxxxxxxxxxxxxxxxxx`,
                created: new Date().toISOString(),
                lastUsed: null,
                permissions: newKeyPermissions,
                active: true
            };
            
            setApiKeys([...apiKeys, newKey]);
            setNewKeyName('');
            setNewKeyPermissions(['read']);
            setShowCreateForm(false);
            success('API key created successfully');
        } catch (error) {
            console.error("Failed to create API key:", error);
            reportError(error);
            showError('Failed to create API key');
        } finally {
            setLoading(false);
        }
    }

    async function handleRevokeKey(keyId) {
        try {
            setLoading(true);
            
            // In a real app, this would call an API to revoke the key
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            
            setApiKeys(apiKeys.map(key => 
                key.id === keyId ? { ...key, active: false } : key
            ));
            
            success('API key revoked successfully');
        } catch (error) {
            console.error("Failed to revoke API key:", error);
            reportError(error);
            showError('Failed to revoke API key');
        } finally {
            setLoading(false);
        }
    }

    function formatDate(dateString) {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString() + ' ' + 
               new Date(dateString).toLocaleTimeString();
    }

    function maskKey(key) {
        return key.substring(0, 8) + '...' + key.substring(key.length - 4);
    }

    return (
        <div data-name="api-keys-settings">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">API Keys</h2>
                <button
                    className="bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg flex items-center"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? (
                        <span>Cancel</span>
                    ) : (
                        <div className="flex items-center">
                            <i className="fas fa-plus mr-2"></i>
                            <span>Create API Key</span>
                        </div>
                    )}
                </button>
            </div>
            
            {showCreateForm && (
                <div className="glass-effect rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-semibold mb-4">Create New API Key</h3>
                    <form onSubmit={handleCreateKey} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Key Name</label>
                            <input
                                type="text"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                placeholder="e.g., Development Key"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Permissions</label>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="permission-read"
                                        checked={newKeyPermissions.includes('read')}
                                        onChange={() => handlePermissionChange('read')}
                                        className="mr-2"
                                    />
                                    <label htmlFor="permission-read">Read (View models, datasets, etc.)</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="permission-write"
                                        checked={newKeyPermissions.includes('write')}
                                        onChange={() => handlePermissionChange('write')}
                                        className="mr-2"
                                    />
                                    <label htmlFor="permission-write">Write (Create, update models, etc.)</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="permission-delete"
                                        checked={newKeyPermissions.includes('delete')}
                                        onChange={() => handlePermissionChange('delete')}
                                        className="mr-2"
                                    />
                                    <label htmlFor="permission-delete">Delete (Remove models, datasets, etc.)</label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || !newKeyName}
                                className={`
                                    px-6 py-2 rounded-lg font-semibold
                                    ${loading || !newKeyName ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary-main hover:bg-primary-dark'}
                                `}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Creating...
                                    </span>
                                ) : 'Create API Key'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="space-y-6">
                <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-2">
                        <i className="fas fa-info-circle mr-2"></i>
                        API keys provide access to the JoyNet API. Keep your keys secure and never share them publicly.
                    </div>
                    <a href="/docs/api" className="text-primary-light hover:text-primary-main text-sm">
                        View API Documentation
                    </a>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full min-w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                                <th className="pb-3 pl-2">Name</th>
                                <th className="pb-3">Key</th>
                                <th className="pb-3">Created</th>
                                <th className="pb-3">Last Used</th>
                                <th className="pb-3">Permissions</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3 text-right pr-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apiKeys.map(key => (
                                <tr 
                                    key={key.id}
                                    className={`border-b border-white/5 ${key.active ? 'hover:bg-white/5' : 'opacity-50'}`}
                                >
                                    <td className="py-3 pl-2">{key.name}</td>
                                    <td className="py-3">
                                        <div className="font-mono text-sm">
                                            {maskKey(key.key)}
                                        </div>
                                    </td>
                                    <td className="py-3">{formatDate(key.created)}</td>
                                    <td className="py-3">{formatDate(key.lastUsed)}</td>
                                    <td className="py-3">
                                        <div className="flex space-x-1">
                                            {key.permissions.map(permission => (
                                                <span 
                                                    key={permission}
                                                    className="px-2 py-1 bg-primary-main/20 text-primary-light rounded-full text-xs"
                                                >
                                                    {permission}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            key.active 
                                                ? 'bg-success-main/20 text-success-light' 
                                                : 'bg-error-main/20 text-error-light'
                                        }`}>
                                            {key.active ? 'Active' : 'Revoked'}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right pr-2">
                                        {key.active ? (
                                            <button
                                                onClick={() => handleRevokeKey(key.id)}
                                                className="text-error-light hover:text-error-main"
                                                disabled={loading}
                                            >
                                                Revoke
                                            </button>
                                        ) : (
                                            <span className="text-gray-500">Revoked</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {apiKeys.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-400">No API keys found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
