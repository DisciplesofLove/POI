function ChatHeader({ mode, onModeToggle, onClose, currentUser }) {
    return (
        <div className="p-4 bg-gradient-to-r from-primary-dark to-primary-main border-b border-white/20">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-white">
                    {mode === 'ai' ? 'AI Assistant' : 'Community Chat'}
                </h3>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={onModeToggle} 
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
                        title={mode === 'ai' ? 'Switch to Community Chat' : 'Switch to AI Assistant'}
                    >
                        <i className={`fas ${mode === 'ai' ? 'fa-users' : 'fa-robot'} text-sm`}></i>
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
                    >
                        <i className="fas fa-times text-sm"></i>
                    </button>
                </div>
            </div>
            {mode === 'community' && !currentUser && (
                <div className="mt-2 text-xs text-white bg-yellow-600/60 p-2 rounded">
                    <i className="fas fa-info-circle mr-1"></i>
                    Login to fully participate in community discussions
                </div>
            )}
        </div>
    );
}
