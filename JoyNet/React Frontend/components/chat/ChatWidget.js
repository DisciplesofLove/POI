function ChatWidget() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [messages, setMessages] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [chatMode, setChatMode] = React.useState('ai');
    const { error: showError } = useNotification();
    const messageContainerRef = React.useRef(null);
    const { currentUser } = useAuth();

    // Initialize with welcome message
    React.useEffect(() => {
        const welcomeMessage = {
            id: Date.now().toString(),
            sender: 'ai',
            content: "Hi! I'm your AI assistant. How can I help you today?",
            timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
    }, []);

    // Scroll to bottom when messages change
    React.useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Handle mobile viewport height
    React.useEffect(() => {
        function handleResize() {
            document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    function createNewMessage(content, sender) {
        return {
            id: Date.now().toString(),
            sender,
            content,
            timestamp: new Date().toISOString()
        };
    }

    function trimConversation(messages, maxLength = 10) {
        return messages.slice(-maxLength);
    }

    async function handleSendMessage(message) {
        try {
            if (!message.trim()) return;
            setLoading(true);
            
            const userMessage = createNewMessage(message, 'user');
            setMessages(prev => [...prev, userMessage]);

            let response;
            if (chatMode === 'ai') {
                const systemPrompt = "You are a helpful AI assistant for the JoyNet AI marketplace. Be concise and use emojis occasionally.";
                response = await invokeAIAgent(systemPrompt, message);
            } else {
                const communityMembers = ['Alice', 'Bob', 'Charlie', 'Diana'];
                const randomMember = communityMembers[Math.floor(Math.random() * communityMembers.length)];
                response = `[${randomMember}]: Thanks for your message! A community member will respond to you soon.`;
            }
            
            const responseMessage = createNewMessage(
                response,
                chatMode === 'ai' ? 'ai' : 'community'
            );
            
            setMessages(prev => trimConversation([...prev, responseMessage]));
        } catch (error) {
            showError('Failed to process message');
            reportError(error);
        } finally {
            setLoading(false);
        }
    }

    function toggleChatMode() {
        const newMode = chatMode === 'ai' ? 'community' : 'ai';
        setChatMode(newMode);
        
        const systemMessage = createNewMessage(
            newMode === 'ai' 
                ? "Switched to AI Assistant mode. How can I help you today?" 
                : "Switched to Community Chat mode. Connect with other JoyNet members!",
            'system'
        );
        
        setMessages(prev => trimConversation([...prev, systemMessage]));
    }

    return (
        <div className="fixed bottom-4 right-4 z-50" data-name="chat-widget">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-main to-primary-light 
                          hover:from-primary-dark hover:to-primary-main flex items-center justify-center 
                          shadow-lg border-2 border-white/20"
                data-name="chat-button"
            >
                <i className={`fas ${isOpen ? 'fa-times' : 'fa-comment'} text-white text-xl`}></i>
            </button>

            {isOpen && (
                <div 
                    className="fixed md:absolute bottom-16 right-0 w-[calc(100vw-2rem)] md:w-96 bg-secondary-dark rounded-lg shadow-xl 
                             border border-white/20 overflow-hidden md:max-h-[600px]"
                    style={{ 
                        height: window.innerWidth >= 768 ? '500px' : 'calc(var(--vh, 1vh) * 100 - 120px)',
                        maxWidth: window.innerWidth >= 768 ? '24rem' : 'calc(100vw - 2rem)',
                        left: window.innerWidth >= 768 ? 'auto' : '1rem'
                    }}
                    data-name="chat-window"
                >
                    <div className="flex flex-col h-full">
                        <ChatHeader 
                            mode={chatMode}
                            onModeToggle={toggleChatMode}
                            onClose={() => setIsOpen(false)}
                            currentUser={currentUser}
                        />
                        <ChatMessages 
                            messages={messages}
                            loading={loading}
                            messageContainerRef={messageContainerRef}
                        />
                        <ChatInput 
                            onSendMessage={handleSendMessage}
                            loading={loading}
                            mode={chatMode}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
