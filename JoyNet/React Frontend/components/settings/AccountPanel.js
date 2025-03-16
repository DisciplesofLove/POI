function AccountPanel() {
    try {
        const { currentUser } = useAuth();
        const { success, error: showError } = useNotification();
        const [loading, setLoading] = React.useState(false);
        const [passwordData, setPasswordData] = React.useState({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        const [emailData, setEmailData] = React.useState({
            email: currentUser?.email || '',
            password: ''
        });

        function handlePasswordChange(e) {
            const { name, value } = e.target;
            setPasswordData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        function handleEmailChange(e) {
            const { name, value } = e.target;
            setEmailData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        async function handlePasswordSubmit(e) {
            e.preventDefault();
            
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                showError('New passwords do not match');
                return;
            }
            
            try {
                setLoading(true);
                
                // In a real app, this would call an API to update the password
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
                
                // Reset form
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                
                success('Password updated successfully');
            } catch (error) {
                console.error("Failed to update password:", error);
                reportError(error);
                showError('Failed to update password');
            } finally {
                setLoading(false);
            }
        }

        async function handleEmailSubmit(e) {
            e.preventDefault();
            
            try {
                setLoading(true);
                
                // In a real app, this would call an API to update the email
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
                
                // Reset form
                setEmailData({
                    email: emailData.email,
                    password: ''
                });
                
                success('Email updated successfully');
            } catch (error) {
                console.error("Failed to update email:", error);
                reportError(error);
                showError('Failed to update email');
            } finally {
                setLoading(false);
            }
        }

        async function handleDeleteAccount() {
            try {
                // In a real app, this would show a confirmation modal and then delete the account
                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    setLoading(true);
                    
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    success('Account deleted successfully');
                    
                    // In a real app, this would redirect to the home page or login page
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                }
            } catch (error) {
                console.error("Failed to delete account:", error);
                reportError(error);
                showError('Failed to delete account');
                setLoading(false);
            }
        }

        return (
            <div data-name="account-settings">
                <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>
                
                <div className="space-y-8">
                    <div className="border-b border-white/10 pb-8">
                        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                    required
                                />
                            </div>
                            
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`
                                        px-6 py-2 rounded-lg font-semibold
                                        ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary-main hover:bg-primary-dark'}
                                    `}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <i className="fas fa-spinner fa-spin mr-2"></i>
                                            Updating...
                                        </span>
                                    ) : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <div className="border-b border-white/10 pb-8">
                        <h3 className="text-lg font-semibold mb-4">Change Email</h3>
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">New Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={emailData.email}
                                    onChange={handleEmailChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={emailData.password}
                                    onChange={handleEmailChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                    placeholder="Enter your password to confirm"
                                    required
                                />
                            </div>
                            
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`
                                        px-6 py-2 rounded-lg font-semibold
                                        ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary-main hover:bg-primary-dark'}
                                    `}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <i className="fas fa-spinner fa-spin mr-2"></i>
                                            Updating...
                                        </span>
                                    ) : 'Update Email'}
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Danger Zone</h3>
                        <div className="bg-error-main/10 border border-error-main/20 rounded-lg p-4">
                            <h4 className="text-error-light font-semibold mb-2">Delete Account</h4>
                            <p className="text-sm text-gray-300 mb-4">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="bg-error-main hover:bg-error-dark px-6 py-2 rounded-lg font-semibold"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("AccountPanel render error:", error);
        reportError(error);
        return <div>Error loading account settings</div>;
    }
}
