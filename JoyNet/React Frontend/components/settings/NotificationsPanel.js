function NotificationsPanel() {
    const { success, error: showError } = useNotification();
    const [loading, setLoading] = React.useState(false);
    const [notificationSettings, setNotificationSettings] = React.useState({
        emailNotifications: true,
        pushNotifications: false,
        marketplaceUpdates: true,
        newModels: true,
        priceAlerts: true,
        securityAlerts: true,
        newsletterUpdates: false,
        communityUpdates: true,
        mentionNotifications: true,
        dailyDigest: false
    });

    function handleChange(e) {
        const { name, checked } = e.target;
        setNotificationSettings(prev => ({
            ...prev,
            [name]: checked
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            // In a real app, this would call an API to update the settings
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            
            success('Notification settings updated successfully');
        } catch (error) {
            console.error("Failed to update notification settings:", error);
            reportError(error);
            showError('Failed to update notification settings');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div data-name="notification-settings">
            <h2 className="text-2xl font-semibold mb-6">Notification Settings</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Notification Methods</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Email Notifications</h4>
                                <p className="text-sm text-gray-400">Receive notifications via email</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="emailNotifications"
                                    checked={notificationSettings.emailNotifications}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Push Notifications</h4>
                                <p className="text-sm text-gray-400">Receive notifications in your browser</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="pushNotifications"
                                    checked={notificationSettings.pushNotifications}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Marketplace Notifications</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Marketplace Updates</h4>
                                <p className="text-sm text-gray-400">News about marketplace features and updates</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="marketplaceUpdates"
                                    checked={notificationSettings.marketplaceUpdates}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">New Models</h4>
                                <p className="text-sm text-gray-400">Notifications about new AI models</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="newModels"
                                    checked={notificationSettings.newModels}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Price Alerts</h4>
                                <p className="text-sm text-gray-400">Notifications about price changes</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="priceAlerts"
                                    checked={notificationSettings.priceAlerts}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Security Notifications</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Security Alerts</h4>
                                <p className="text-sm text-gray-400">Important alerts about your account security</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="securityAlerts"
                                    checked={notificationSettings.securityAlerts}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                    <p className="text-sm text-warning-light mt-2">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        Security notifications cannot be disabled for your account safety
                    </p>
                </div>
                
                <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Community & Updates</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Newsletter Updates</h4>
                                <p className="text-sm text-gray-400">Receive our weekly newsletter</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="newsletterUpdates"
                                    checked={notificationSettings.newsletterUpdates}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Community Updates</h4>
                                <p className="text-sm text-gray-400">Updates from the JoyNet community</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="communityUpdates"
                                    checked={notificationSettings.communityUpdates}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Mentions & Replies</h4>
                                <p className="text-sm text-gray-400">When someone mentions or replies to you</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="mentionNotifications"
                                    checked={notificationSettings.mentionNotifications}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Daily Digest</h4>
                                <p className="text-sm text-gray-400">Daily summary of your notifications</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    name="dailyDigest"
                                    checked={notificationSettings.dailyDigest}
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
