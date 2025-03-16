function useAuth() {
    const [currentUser, setCurrentUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    
    React.useEffect(() => {
        // Check if user is already logged in
        const storedUser = localStorage.getItem('joynet_user');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user:", e);
                reportError(e);
            }
        }
        setLoading(false);
    }, []);
    
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            
            // In a real app, this would call your authentication API
            // For demo purposes, we'll simulate a successful login
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check credentials (this is just for demo)
            if (email === 'demo@joynet.ai' && password === 'password') {
                const user = {
                    id: 'user123',
                    email: email,
                    username: 'DemoUser',
                    avatar: 'https://avatars.dicebear.com/api/jdenticon/demo.svg',
                    role: 'user',
                    createdAt: new Date().toISOString()
                };
                
                // Store in local storage
                localStorage.setItem('joynet_user', JSON.stringify(user));
                setCurrentUser(user);
                return user;
            } else {
                throw new Error('Invalid email or password');
            }
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            
            // In a real app, this would call your registration API
            // For demo purposes, we'll simulate a successful registration
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const user = {
                id: 'user' + Date.now(),
                email: userData.email,
                username: userData.username,
                avatar: `https://avatars.dicebear.com/api/jdenticon/${userData.username}.svg`,
                role: 'user',
                createdAt: new Date().toISOString()
            };
            
            // Store in local storage
            localStorage.setItem('joynet_user', JSON.stringify(user));
            setCurrentUser(user);
            return user;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    const logout = () => {
        localStorage.removeItem('joynet_user');
        setCurrentUser(null);
    };
    
    const updateProfile = async (profileData) => {
        try {
            setLoading(true);
            setError(null);
            
            // In a real app, this would call your API to update the profile
            // For demo purposes, we'll simulate a successful update
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const updatedUser = {
                ...currentUser,
                ...profileData,
                updatedAt: new Date().toISOString()
            };
            
            // Store in local storage
            localStorage.setItem('joynet_user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            return updatedUser;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    return {
        currentUser,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile
    };
}
