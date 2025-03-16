function trimMessages(messages, maxMessages = 10) {
    // Keep only the last N messages to prevent context overflow
    return messages.slice(-maxMessages);
}

function formatContext(messages) {
    // Format recent messages into a concise context string
    return messages
        .map(msg => `${msg.sender}: ${msg.content}`)
        .join('\n');
}

function createMessage(content, sender) {
    return {
        id: Date.now().toString(),
        sender,
        content,
        timestamp: new Date().toISOString()
    };
}

async function processAIMessage(message, recentMessages) {
    try {
        const context = formatContext(trimMessages(recentMessages));
        const systemPrompt = `You are a helpful AI assistant for the JoyNet AI marketplace. 
        Be concise and use emojis occasionally.
        Previous context:
        ${context}`;
        
        return await invokeAIAgent(systemPrompt, message);
    } catch (error) {
        console.error('AI processing error:', error);
        reportError(error);
        throw new Error('Failed to process message');
    }
}

function simulateCommunityResponse(message) {
    const communityMembers = ['Alice', 'Bob', 'Charlie', 'Diana'];
    const randomMember = communityMembers[Math.floor(Math.random() * communityMembers.length)];
    return `[${randomMember}]: Thanks for your message! A community member will respond to you soon.`;
}
