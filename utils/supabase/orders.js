// Get the Supabase client from the global window object
function getClient() {
    return window.supabaseClient;
}

// Create a new order
async function createOrder(orderData) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select();
            
        if (error) throw error;
        
        return { success: true, data: data[0] };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}

// Update order status
async function updateOrderStatus(id, status, transactionHash = null) {
    try {
        const supabase = getClient();
        const updateData = { status };
        if (transactionHash) {
            updateData.transaction_hash = transactionHash;
        }
        
        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', id)
            .select();
            
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}

// Get user orders (as buyer)
async function getUserOrders(userId) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                listing:listings(*),
                seller:profiles(username, display_name, avatar_url)
            `)
            .eq('buyer_id', userId)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        return data;
    } catch (error) {
        reportError(error);
        return [];
    }
}

// Get user sales (as seller)
async function getUserSales(userId) {
    try {
        const supabase = getClient();
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                listing:listings(*),
                buyer:profiles(username, display_name, avatar_url)
            `)
            .eq('seller_id', userId)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        return data;
    } catch (error) {
        reportError(error);
        return [];
    }
}
