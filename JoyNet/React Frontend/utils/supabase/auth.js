// Get the Supabase client from the global window object
function getClient() {
    return window.supabaseClient;
}

// Sign up a new user
async function signUp(email, password, username) {
    try {
        const supabase = getClient();
        // Check if username is available
        const { data: existingUsers, error: usernameError } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .single();
            
        if (existingUsers) {
            throw new Error('Username already taken');
        }
        
        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        
        if (error) throw error;
        
        // Create profile for the new user
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        username,
                        display_name: username,
                        avatar_url: `https://avatars.dicebear.com/api/identicon/${username}.svg`,
                    }
                ]);
                
            if (profileError) throw profileError;
        }
        
        return { success: true, user: data.user };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}

// Sign in a user
async function signIn(email, password) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) throw error;
        
        return { success: true, user: data.user, session: data.session };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}

// Sign out the current user
async function signOut() {
    try {
        const supabase = getClient();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}

// Get the current user
async function getCurrentUser() {
    try {
        const supabase = getClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (user) {
            // Get user profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
                
            if (profileError) throw profileError;
            
            return { ...user, profile };
        }
        
        return null;
    } catch (error) {
        reportError(error);
        return null;
    }
}

// Reset password
async function resetPassword(email) {
    try {
        const supabase = getClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://6z6rtc40n38b.trickle.host/reset-password',
        });
        
        if (error) throw error;
        
        return { success: true };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}

// Update user password
async function updatePassword(newPassword) {
    try {
        const supabase = getClient();
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        
        if (error) throw error;
        
        return { success: true };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}
