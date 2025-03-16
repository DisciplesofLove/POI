// Get the Supabase client from the global window object
function getClient() {
    return window.supabaseClient;
}

// Get user profile
async function getUserProfile(userId) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (error) throw error;
        
        return data;
    } catch (error) {
        reportError(error);
        return null;
    }
}

// Update user profile
async function updateUserProfile(userId, profileData) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', userId);
            
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}
