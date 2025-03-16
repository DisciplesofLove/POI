// Get the Supabase client from the global window object
function getClient() {
    return window.supabaseClient;
}

// Send a message
async function sendMessage(recipientId, content) {
    try {
        const supabase = getClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
            .from('messages')
            .insert([
                {
                    sender_id: user.id,
                    recipient_id: recipientId,
                    content
                }
            ])
            .select();
            
        if (error) throw error;
        
        return { success: true, data: data[0] };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}

// Get conversation with a user
async function getConversation(otherUserId) {
    try {
        const supabase = getClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .or(`sender_id.eq.${otherUserId},recipient_id.eq.${otherUserId}`)
            .order('created_at', { ascending: true });
            
        if (error) throw error;
        
        // Filter messages to only include those between these two users
        const conversation = data.filter(message => 
            (message.sender_id === user.id && message.recipient_id === otherUserId) ||
            (message.sender_id === otherUserId && message.recipient_id === user.id)
        );
        
        return conversation;
    } catch (error) {
        reportError(error);
        return [];
    }
}

// Get user conversations
async function getUserConversations() {
    try {
        const supabase = getClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error('User not authenticated');
        
        // This uses the conversations view we created in SQL
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        return data;
    } catch (error) {
        reportError(error);
        return [];
    }
}

// Mark messages as read
async function markMessagesAsRead(senderId) {
    try {
        const supabase = getClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error('User not authenticated');
        
        const { error } = await supabase
            .rpc('mark_messages_as_read', {
                sender_uuid: senderId,
                recipient_uuid: user.id
            });
            
        if (error) throw error;
        
        return { success: true };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}

// Get unread message count
async function getUnreadMessageCount() {
    try {
        const supabase = getClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
            .rpc('get_unread_message_count', {
                user_id: user.id
            });
            
        if (error) throw error;
        
        return data;
    } catch (error) {
        reportError(error);
        return 0;
    }
}

// Subscribe to new messages
function subscribeToMessages(callback) {
    try {
        const supabase = getClient();
        const { data: { user } } = supabase.auth.getUser();
        
        if (!user) throw new Error('User not authenticated');
        
        const subscription = supabase
            .channel('messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `recipient_id=eq.${user.id}`
                },
                (payload) => {
                    callback(payload.new);
                }
            )
            .subscribe();
            
        return subscription;
    } catch (error) {
        reportError(error);
        return null;
    }
}

// Delete a message
async function deleteMessage(messageId) {
    try {
        const supabase = getClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error('User not authenticated');
        
        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('id', messageId)
            .eq('sender_id', user.id); // Only allow deleting own messages
            
        if (error) throw error;
        
        return { success: true };
    } catch (error) {
        reportError(error);
        return { success: false, error: error.message };
    }
}

// Get message statistics
async function getMessageStats() {
    try {
        const supabase = getClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
            
        if (error) throw error;
        
        const stats = {
            totalSent: data.filter(m => m.sender_id === user.id).length,
            totalReceived: data.filter(m => m.recipient_id === user.id).length,
            unreadCount: data.filter(m => m.recipient_id === user.id && !m.is_read).length
        };
        
        return stats;
    } catch (error) {
        reportError(error);
        return {
            totalSent: 0,
            totalReceived: 0,
            unreadCount: 0
        };
    }
}
