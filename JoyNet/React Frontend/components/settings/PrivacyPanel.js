function PrivacyPanel() {
    const { success, error: showError } = useNotification();
    const [loading, setLoading] = React.useState(false);
    const [privacySettings, setPrivacySettings] = React.useState({
        profileVisibility: 'public',
        activityVisibility: 'followers',
        searchEngineIndexing: true,
        dataCollection: true,
        thirdPartySharing: false,
        personalizedAds: false,
        cookiePreferences: {
            necessary: true,
            preferences: true,
            statistics: true,
            marketing: false
        }
    });

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        
        if (name.startsWith('cookie-')) {
            const cookieType = name.replace('cookie-', '');
            setPrivacySettings(prev => ({
                ...prev,
                cookiePreferences: {
                    ...prev.cookiePreferences,
                    [cookieType]: checked
                }
            }));
        } else {
            setPrivacySettings(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            // In a real app, this would call an API to update the settings
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            
            success('Privacy settings updated successfully');
        } catch (error) {
            console.error("Failed to update privacy settings:", error);
            reportError(error);
            showError('Failed to update privacy settings');
        } finally {
            setLoading(false);
        }
    }

    async function handleDownloadData() {
        try {
            setLoading(true);
            
            // In a real app, this would call an API to request data download
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
            
            success('Data export initiated. You will receive an email with your data shortly.');
        } catch (error) {
            console.error("Failed to request data download:", error);
            reportError(error);
            showError('Failed to request data download');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div data-name="privacy-settings">
            <h2 className="text-2xl font-semibold mb-6">Privacy Settings</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Profile Privacy</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Profile Visibility</label>
                            <select
                                name="profileVisibility"
                                value={privacySettings.profileVisibility}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            >
                                <option value="public">Public - Visible to everyone</option>
                                <option value="followers">Followers Only - Visible to users who follow you</option>
                                <option value="private">Private - Only visible to you</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Activity Visibility</label>
                            <select
                                name="activityVisibility"
                                value={privacySettings.activityVisibility}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                            >
                                <option value="public">Public - Visible to everyone</option>
                                <option value="followers">Followers Only - Visible to users who follow you</option>
                                <option value="private">Private - Only visible to you</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Search Engine Indexing</h4>
                                <p className="text-sm text-gray-400">Allow search engines to index your profile</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="searchEngineIndexing"
                                    checked={privacySettings.searchEngineIndexing}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Data Collection & Sharing</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Data Collection</h4>
                                <p className="text-sm text-gray-400">Allow JoyNet to collect usage data to improve the platform</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="dataCollection"
                                    checked={privacySettings.dataCollection}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Third-Party Data Sharing</h4>
                                <p className="text-sm text-gray-400">Allow JoyNet to share your data with third parties</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="thirdPartySharing"
                                    checked={privacySettings.thirdPartySharing}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Personalized Ads</h4>
                                <p className="text-sm text-gray-400">Allow JoyNet to show personalized ads based on your activity</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="personalizedAds"
                                    checked={privacySettings.personalizedAds}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Cookie Preferences</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Necessary Cookies</h4>
                                <p className="text-sm text-gray-400">Required for the website to function properly</p>
                            </div>
                            <label className="switch opacity-50">
                                <input 
                                    type="checkbox" 
                                    name="cookie-necessary"
                                    checked={privacySettings.cookiePreferences.necessary}
                                    disabled={true}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Preference Cookies</h4>
                                <p className="text-sm text-gray-400">Remember your preferences and settings</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="cookie-preferences"
                                    checked={privacySettings.cookiePreferences.preferences}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Statistics Cookies</h4>
                                <p className="text-sm text-gray-400">Help us understand how you use the website</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="cookie-statistics"
                                    checked={privacySettings.cookiePreferences.statistics}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Marketing Cookies</h4>
                                <p className="text-sm text-gray-400">Used to track you across websites for marketing purposes</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="cookie-marketing"
                                    checked={privacySettings.cookiePreferences.marketing}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Your Data</h3>
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={handleDownloadData}
                            disabled={loading}
                            className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Processing...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <i className="fas fa-download mr-2"></i>
                                    Download Your Data
                                </span>
                            )}
                        </button>
                        
                        <p className="text-sm text-gray-400">
                            You can request a copy of all the data we have stored about you. This process may take some time.
                        </p>
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
