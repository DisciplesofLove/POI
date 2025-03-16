function ProfilePanel() {
    try {
        const { currentUser, updateProfile } = useAuth();
        const { success, error: showError } = useNotification();
        const [loading, setLoading] = React.useState(false);
        const [formData, setFormData] = React.useState({
            displayName: currentUser?.displayName || '',
            bio: currentUser?.bio || '',
            location: currentUser?.location || '',
            website: currentUser?.website || '',
            twitter: currentUser?.twitter || '',
            github: currentUser?.github || '',
            avatar: currentUser?.avatar || ''
        });
        const [avatarPreview, setAvatarPreview] = React.useState(currentUser?.avatar || '');

        function handleChange(e) {
            const { name, value } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        function handleAvatarChange(e) {
            const file = e.target.files[0];
            if (file) {
                // For a real app, this would upload the file to a server
                // For this demo, we'll just create a data URL
                const reader = new FileReader();
                reader.onloadend = () => {
                    setAvatarPreview(reader.result);
                    setFormData(prev => ({
                        ...prev,
                        avatar: reader.result
                    }));
                };
                reader.readAsDataURL(file);
            }
        }

        async function handleSubmit(e) {
            e.preventDefault();
            
            try {
                setLoading(true);
                await updateProfile(formData);
                success('Profile updated successfully');
            } catch (error) {
                console.error("Failed to update profile:", error);
                reportError(error);
                showError('Failed to update profile');
            } finally {
                setLoading(false);
            }
        }

        return (
            <div data-name="profile-settings">
                <h2 className="text-2xl font-semibold mb-6">Profile Settings</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="md:w-1/3 flex flex-col items-center">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-white/10 mb-4">
                                {avatarPreview ? (
                                    <img 
                                        src={avatarPreview} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <i className="fas fa-user text-4xl"></i>
                                    </div>
                                )}
                            </div>
                            <label className="bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg cursor-pointer">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                                Change Avatar
                            </label>
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                Recommended: 500x500 pixels
                            </p>
                        </div>
                        
                        <div className="md:w-2/3 space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Display Name</label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                    placeholder="Your display name"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                    placeholder="Tell us about yourself"
                                ></textarea>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                    placeholder="Your location"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-6">
                        <h3 className="text-lg font-semibold mb-4">Social Links</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Website</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="fas fa-globe text-gray-400"></i>
                                    </div>
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white"
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Twitter</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="fab fa-twitter text-gray-400"></i>
                                    </div>
                                    <input
                                        type="text"
                                        name="twitter"
                                        value={formData.twitter}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white"
                                        placeholder="@username"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">GitHub</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i className="fab fa-github text-gray-400"></i>
                                    </div>
                                    <input
                                        type="text"
                                        name="github"
                                        value={formData.github}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white"
                                        placeholder="username"
                                    />
                                </div>
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
                            ) : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        );
    } catch (error) {
        console.error("ProfilePanel render error:", error);
        reportError(error);
        return <div>Error loading profile settings</div>;
    }
}
