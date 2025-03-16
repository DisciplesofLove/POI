function ChatMessages({ messages, loading, messageContainerRef }) {
    return (
        <div className="flex-1 overflow-y-auto p-4 bg-gray-900/90" ref={messageContainerRef}>
            {messages.map(message => (
                <div 
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                    {message.sender === 'system' ? (
                        <div className="max-w-[90%] bg-gray-700 text-white rounded-lg p-3 text-center text-sm shadow-md">
                            <p>{message.content}</p>
                        </div>
                    ) : (
                        <div className={`
                            max-w-[80%] rounded-lg p-3 shadow-md
                            ${message.sender === 'user' 
                                ? 'bg-primary-main text-white' 
                                : message.sender === 'community'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-white'}
                        `}>
                            <p>{message.content}</p>
                            <div className={`
                                text-xs mt-1
                                ${message.sender === 'user' ? 'text-white/80' : 'text-white/70'}
                                text-right
                            `}>
                                {new Date(message.timestamp).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </div>
                        </div>
                    )}
                </div>
            ))}
            
            {loading && (
                <div className="flex justify-start mb-4">
                    <div className="bg-gray-700 text-white rounded-lg p-3 max-w-[80%] shadow-md">
                        <div className="flex space-x-2">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse delay-75"></div>
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse delay-150"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
