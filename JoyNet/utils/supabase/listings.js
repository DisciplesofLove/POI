// Get the Supabase client from the global window object
function getClient() {
    return window.supabaseClient;
}

// Get all listings
async function getListings(category = null, limit = 100, page = 1) {
    try {
        const supabase = getClient();
        let query = supabase
            .from('listings')
            .select(`
                *,
                author:profiles(username, display_name, avatar_url)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);
            
        if (category) {
            query = query.eq('category', category);
        }
        
        const { data, error, count } = await query.limit(limit);
        
        if (error) throw error;
        
        return { data, count };
    } catch (error) {
        reportError(error);
        return { data: [], count: 0 };
    }
}

// Get a single listing by ID
async function getListingById(id) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase
            .from('listings')
            .select(`
                *,
                author:profiles(username, display_name, avatar_url),
                reviews(*)
            `)
            .eq('id', id)
            .single();
            
        if (error) throw error;
        
        return data;
    } catch (error) {
        reportError(error);
        return null;
    }
}

// Create a new listing
async function createListing(listingData) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase
            .from('listings')
            .insert([listingData])
            .select();
            
        if (error) throw error;
        
        return { success: true, data: data[0] };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}

// Update a listing
async function updateListing(id, listingData) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase
            .from('listings')
            .update(listingData)
            .eq('id', id)
            .select();
            
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}

// Delete a listing
async function deleteListing(id) {
    try {
        const supabase = getClient();
        const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        
        return { success: true };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}

// Get user listings
async function getUserListings(userId) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .eq('author_id', userId)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        return data;
    } catch (error) {
        reportError(error);
        return [];
    }
}
