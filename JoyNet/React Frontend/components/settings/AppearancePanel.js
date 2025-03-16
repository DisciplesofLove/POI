function AppearancePanel() {
    const { success, error: showError } = useNotification();
    const [loading, setLoading] = React.useState(false);
    const [appearanceSettings, setAppearanceSettings] = React.useState({
        theme: 'dark',
        accentColor: 'purple',
        fontSize: 'medium',
        reducedMotion: false,
        highContrast: false,
        compactMode: false,
        sidebarPosition: 'left'
    });

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setAppearanceSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            // In a real app, this would call an API to update the settings
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            
            success('Appearance settings updated successfully');
        } catch (error) {
            console.error("Failed to update appearance settings:", error);
            reportError(error);
            showError('Failed to update appearance settings');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div data-name="appearance-settings">
            <h2 className="text-2xl font-semibold mb-6">Appearance Settings</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Theme Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Theme</label>
                            <div className="grid grid-cols-3 gap-4">
                                <label className={`
                                    flex flex-col items-center p-4 rounded-lg cursor-pointer
                                    ${appearanceSettings.theme === 'dark' 
                                        ? 'bg-primary-main/20 border border-primary-main/50' 
                                        : 'bg-white/5 border border-white/10 hover:bg-white/10'}
                                `}>
                                    <input
                                        type="radio"
                                        name="theme"
                                        value="dark"
                                        checked={appearanceSettings.theme === 'dark'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className="w-full h-20 bg-secondary-dark rounded-lg mb-2 flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full bg-primary-main"></div>
                                    </div>
                                    <span>Dark</span>
                                </label>
                                
                                <label className={`
                                    flex flex-col items-center p-4 rounded-lg cursor-pointer
                                    ${appearanceSettings.theme === 'light' 
                                        ? 'bg-primary-main/20 border border-primary-main/50' 
                                        : 'bg-white/5 border border-white/10 hover:bg-white/10'}
                                `}>
                                    <input
                                        type="radio"
                                        name="theme"
                                        value="light"
                                        checked={appearanceSettings.theme === 'light'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className="w-full h-20 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full bg-primary-main"></div>
                                    </div>
                                    <span>Light</span>
                                </label>
                                
                                <label className={`
                                    flex flex-col items-center p-4 rounded-lg cursor-pointer
                                    ${appearanceSettings.theme === 'system' 
                                        ? 'bg-primary-main/20 border border-primary-main/50' 
                                        : 'bg-white/5 border border-white/10 hover:bg-white/10'}
                                `}>
                                    <input
                                        type="radio"
                                        name="theme"
                                        value="system"
                                        checked={appearanceSettings.theme === 'system'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className="w-full h-20 bg-gradient-to-r from-secondary-dark to-gray-200 rounded-lg mb-2 flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full bg-primary-main"></div>
                                    </div>
                                    <span>System</span>
                                </label>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Accent Color</label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                                {['purple', 'blue', 'green', 'red', 'orange', 'pink'].map(color => (
                                    <label key={color} className={`
                                        flex flex-col items-center p-2 rounded-lg cursor-pointer
                                        ${appearanceSettings.accentColor === color 
                                            ? 'bg-white/10 border border-white/20' 
                                            : 'hover:bg-white/5'}
                                    `}>
                                        <input
                                            type="radio"
                                            name="accentColor"
                                            value={color}
                                            checked={appearanceSettings.accentColor === color}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className={`w-8 h-8 rounded-full mb-1 ${
                                            color === 'purple' ? 'bg-purple-500' :
                                            color === 'blue' ? 'bg-blue-500' :
                                            color === 'green' ? 'bg-green-500' :
                                            color === 'red' ? 'bg-red-500' :
                                            color === 'orange' ? 'bg-orange-500' :
                                            'bg-pink-500'
                                        }`}></div>
                                        <span className="text-xs capitalize">{color}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Layout & Display</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Font Size</label>
                            <select
                                name="fontSize"
                                value={appearanceSettings.fontSize}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                                <option value="x-large">Extra Large</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Sidebar Position</label>
                            <select
                                name="sidebarPosition"
                                value={appearanceSettings.sidebarPosition}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            >
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Compact Mode</h4>
                                <p className="text-sm text-gray-400">Reduce spacing in the UI for a more compact view</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="compactMode"
                                    checked={appearanceSettings.compactMode}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Accessibility</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Reduced Motion</h4>
                                <p className="text-sm text-gray-400">Minimize animations throughout the interface</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="reducedMotion"
                                    checked={appearanceSettings.reducedMotion}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">High Contrast</h4>
                                <p className="text-sm text-gray-400">Increase contrast for better readability</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="highContrast"
                                    checked={appearanceSettings.highContrast}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-white/10">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`
                            px-8 py-3 rounded-lg font-semibold
                            ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary-main hover:bg-primary-dark'}
                        `}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Saving...
                            </span>
                        ) : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
