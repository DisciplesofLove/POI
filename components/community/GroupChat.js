function GroupChat({ group, currentUser }) {
    const [messages, setMessages] = React.useState([]);
    const [messageInput, setMessageInput] = React.useState('');
    const [peerConnections, setPeerConnections] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const { success, error: showError } = useNotification();
    const messageContainerRef = React.useRef(null);

    // WebRTC connections
    const dataChannels = React.useRef({});
    const mediaStream = React.useRef(null);

    React.useEffect(() => {
        if (group) {
            initializeGroupConnection();
            loadGroupChatHistory();
        }

        return () => {
            // Cleanup WebRTC connections
            Object.values(peerConnections).forEach(pc => pc.close());
            if (mediaStream.current) {
                mediaStream.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [group]);

    React.useEffect(() => {
        // Scroll to bottom when messages change
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    async function initializeGroupConnection() {
        try {
            setLoading(true);
            
            // Create peer connections for each member
            const connections = {};
            group.members.forEach(member => {
                if (member.id !== currentUser.id) {
                    const pc = createPeerConnection(member.id);
                    connections[member.id] = pc;
                }
            });
            
            setPeerConnections(connections);
            
            // Initialize WebRTC data channels
            Object.entries(connections).forEach(([memberId, pc]) => {
                const dc = pc.createDataChannel(`groupchat-${group.id}`);
                setupDataChannel(dc, memberId);
                dataChannels.current[memberId] = dc;
            });
            
            success('Connected to group chat');
        } catch (error) {
            console.error('Failed to initialize group connection:', error);
            reportError(error);
            showError('Failed to connect to group chat');
        } finally {
            setLoading(false);
        }
    }

    function createPeerConnection(memberId) {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                // Send candidate to peer via signaling server
                sendIceCandidate(event.candidate, memberId);
            }
        };

        // Handle incoming data channels
        pc.ondatachannel = (event) => {
            setupDataChannel(event.channel, memberId);
        };

        return pc;
    }

    function setupDataChannel(channel, memberId) {
        channel.onopen = () => {
            console.log(`Data channel opened with member ${memberId}`);
        };

        channel.onmessage = (event) => {
            const message = JSON.parse(event.data);
            handleIncomingMessage(message);
        };

        channel.onclose = () => {
            console.log(`Data channel closed with member ${memberId}`);
        };

        channel.onerror = (error) => {
            console.error(`Data channel error with member ${memberId}:`, error);
            reportError(error);
        };
    }

    function handleIncomingMessage(message) {
        setMessages(prev => [...prev, message]);
    }

    async function loadGroupChatHistory() {
        try {
            setLoading(true);
            
            // In a real app, fetch chat history from a local storage or server
            // For demo, use mock data
            const mockMessages = [
                {
                    id: '1',
                    senderId: group.members[0].id,
                    senderName: group.members[0].name,
                    text: 'Hey everyone! Welcome to the group!',
                    timestamp: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: '2',
                    senderId: group.members[1].id,
                    senderName: group.members[1].name,
                    text: 'Thanks for creating this group. Looking forward to our discussions!',
                    timestamp: new Date(Date.now() - 3540000).toISOString()
                },
                {
                    id: '3',
                    senderId: currentUser.id,
                    senderName: currentUser.name,
                    text: 'Great to be here! Let\'s start sharing ideas.',
                    timestamp: new Date(Date.now() - 3480000).toISOString()
                }
            ];
            
            setMessages(mockMessages);
        } catch (error) {
            console.error('Failed to load chat history:', error);
            reportError(error);
            showError('Failed to load chat history');
        } finally {
            setLoading(false);
        }
    }

    async function handleSendMessage(e) {
        e.preventDefault();
        
        if (!messageInput.trim()) return;
        
        try {
            const newMessage = {
                id: Date.now().toString(),
                senderId: currentUser.id,
                senderName: currentUser.name,
                text: messageInput,
                timestamp: new Date().toISOString()
            };
            
            // Add message to local state
            setMessages(prev => [...prev, newMessage]);
            
            // Send message to all connected peers
            Object.values(dataChannels.current).forEach(dc => {
                if (dc.readyState === 'open') {
                    dc.send(JSON.stringify(newMessage));
                }
            });
            
            // Clear input
            setMessageInput('');
        } catch (error) {
            console.error('Failed to send message:', error);
            reportError(error);
            showError('Failed to send message');
        }
    }

    async function handleStartVideoCall() {
        try {
            // Get user media
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            mediaStream.current = stream;
            
            // Add tracks to all peer connections
            Object.values(peerConnections).forEach(pc => {
                stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream);
                });
            });
            
            success('Video call started');
        } catch (error) {
            console.error('Failed to start video call:', error);
            reportError(error);
            showError('Failed to start video call');
        }
    }

    function formatTime(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div className="flex flex-col h-full" data-name="group-chat">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden mr-3">
                        {group.avatar ? (
                            <img 
                                src={group.avatar} 
                                alt={group.name} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <i className="fas fa-users text-gray-400"></i>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold">{group.name}</h3>
                        <p className="text-sm text-gray-400">
                            {group.members.length} members
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button 
                        className="p-2 hover:bg-white/5 rounded-full"
                        onClick={handleStartVideoCall}
                    >
                        <i className="fas fa-video"></i>
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-full">
                        <i className="fas fa-phone"></i>
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-full">
                        <i className="fas fa-info-circle"></i>
                    </button>
                </div>
            </div>
            
            {/* Chat Messages */}
            <div 
                className="flex-1 p-4 overflow-y-auto"
                ref={messageContainerRef}
                data-name="message-container"
            >
                {loading && messages.length === 0 ? (
                    <div className="flex justify-center py-4">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map(message => (
                            <div 
                                key={message.id}
                                className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                                data-name={`message-${message.id}`}
                            >
                                <div className={`
                                    max-w-[70%] rounded-lg p-3
                                    ${message.senderId === currentUser.id 
                                        ? 'bg-primary-main text-white' 
                                        : 'bg-white/10 text-white'}
                                `}>
                                    {message.senderId !== currentUser.id && (
                                        <p className="text-sm font-medium text-primary-light mb-1">
                                            {message.senderName}
                                        </p>
                                    )}
                                    <p>{message.text}</p>
                                    <div className={`
                                        text-xs mt-1
                                        ${message.senderId === currentUser.id ? 'text-white/70' : 'text-gray-400'}
                                        text-right
                                    `}>
                                        {formatTime(message.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t border-white/10">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <button 
                        type="button"
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-full"
                    >
                        <i className="fas fa-plus"></i>
                    </button>
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                    />
                    <button 
                        type="submit"
                        disabled={!messageInput.trim()}
                        className={`
                            p-3 rounded-full
                            ${!messageInput.trim()
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-primary-main hover:bg-primary-dark'}
                        `}
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </div>
    );
}
