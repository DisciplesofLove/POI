function ChatInput({ onSendMessage, loading, mode }) {
    function handleSubmit(e) {
        e.preventDefault();
        const input = e.target.elements.message;
        if (!input.value.trim() || loading) return;
        onSendMessage(input.value);
        input.value = '';
    }

    return (
        <div className="p-4 border-t border-white/20 bg-gray-800">
            <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                    type="text"
                    name="message"
                    placeholder={`Type a message to ${mode === 'ai' ? 'AI Assistant' : 'Community'}...`}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary-light"
                    disabled={loading}
                />
                <button 
                    type="submit"
                    disabled={loading}
                    className={`
                        p-3 rounded-full
                        ${loading
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-main hover:bg-primary-dark text-white'}
                    `}
                >
                    <i className="fas fa-paper-plane"></i>
                </button>
            </form>
        </div>
    );
}
