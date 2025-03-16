function AIAssistant({ onResponse, systemContext = '' }) {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const { error: showError } = useNotification();

    async function processMessage(message, context = '') {
        try {
            setIsProcessing(true);
            
            const systemPrompt = `You are an AI assistant in a community chat platform focused on AI and blockchain technology. 
            Your role is to help users by:
            1. Providing technical assistance with AI models and blockchain concepts
            2. Suggesting relevant resources and documentation
            3. Helping explain complex topics in simple terms
            4. Maintaining a friendly, professional tone
            
            ${systemContext}
            
            Current context: ${context}`;
            
            const response = await invokeAIAgent(systemPrompt, message);
            
            if (onResponse) {
                onResponse({
                    id: Date.now().toString(),
                    sender: 'ai',
                    content: response,
                    timestamp: new Date().toISOString()
                });
            }
            
            return response;
        } catch (error) {
            console.error('AI processing error:', error);
            reportError(error);
            showError('Failed to process message');
            return "I'm sorry, I encountered an error processing your request. Please try again later.";
        } finally {
            setIsProcessing(false);
        }
    }

    return {
        processMessage,
        isProcessing
    };
}
