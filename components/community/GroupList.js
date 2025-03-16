function GroupList({ groups, onSelectGroup, selectedGroupId }) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const { error: showError } = useNotification();

    // Filter groups based on search query
    const filteredGroups = groups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col" data-name="group-list">
            {/* Search Bar */}
            <div className="p-4 border-b border-white/10">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search groups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white"
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
            </div>
            
            {/* Groups */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div>
                        {filteredGroups.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {filteredGroups.map(group => (
                                    <div 
                                        key={group.id}
                                        className={`
                                            flex items-center p-4 cursor-pointer
                                            ${selectedGroupId === group.id ? 'bg-white/10' : 'hover:bg-white/5'}
                                        `}
                                        onClick={() => onSelectGroup(group)}
                                        data-name={`group-${group.id}`}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden">
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
                                            {group.unreadCount > 0 && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-main rounded-full flex items-center justify-center">
                                                    <span className="text-xs">{group.unreadCount}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-3 flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <h3 className="font-medium truncate">{group.name}</h3>
                                                {group.lastMessageTime && (
                                                    <span className="text-xs text-gray-400">
                                                        {formatLastMessageTime(group.lastMessageTime)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between">
                                                <p className="text-sm text-gray-400 truncate">
                                                    {group.lastMessage ? (
                                                        <span>
                                                            <span className="font-medium">{group.lastMessageSender}: </span>
                                                            {group.lastMessage}
                                                        </span>
                                                    ) : (
                                                        <span>{group.description}</span>
                                                    )}
                                                </p>
                                                <span className="text-xs text-gray-400">
                                                    {group.memberCount} members
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <i className="fas fa-users text-4xl text-gray-600 mb-2"></i>
                                {searchQuery ? (
                                    <p className="text-gray-400">No groups matching "{searchQuery}"</p>
                                ) : (
                                    <p className="text-gray-400">No groups found</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Create Group Button */}
            <div className="p-4 border-t border-white/10">
                <button className="w-full bg-primary-main hover:bg-primary-dark py-2 rounded-lg flex items-center justify-center">
                    <i className="fas fa-plus mr-2"></i>
                    Create New Group
                </button>
            </div>
        </div>
    );
}

// Helper function to format the last message time
function formatLastMessageTime(timestamp) {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInDays = Math.floor((now - messageTime) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
        // Today - show time
        return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
        // Yesterday
        return 'Yesterday';
    } else if (diffInDays < 7) {
        // Within a week - show day name
        return messageTime.toLocaleDateString([], { weekday: 'short' });
    } else {
        // Older - show date
        return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}
