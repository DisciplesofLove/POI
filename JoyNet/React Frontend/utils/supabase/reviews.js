// Get the Supabase client from the global window object
function getClient() {
    return window.supabaseClient;
}

// Create a review
async function createReview(reviewData) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase
            .from('reviews')
            .insert([reviewData])
            .select();
            
        if (error) throw error;
        
        return { success: true, data: data[0] };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}

// Update a review
async function updateReview(id, reviewData) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase
            .from('reviews')
            .update(reviewData)
            .eq('id', id)
            .select();
            
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}

// Delete a review
async function deleteReview(id) {
    try {
        const supabase = getClient();
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        
        return { success: true };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}

// Get reviews for a listing
async function getListingReviews(listingId) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                user:profiles(username, display_name, avatar_url)
            `)
            .eq('listing_id', listingId)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        return data;
    } catch (error) {
        reportError(error);
        return [];
    }
}
