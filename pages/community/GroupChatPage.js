function GroupChatPage() {
    const [selectedGroup, setSelectedGroup] = React.useState(null);
    const [groups, setGroups] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const { currentUser } = useAuth();
    const { error: showError } = useNotification();

    React.useEffect(() => {
        loadGroups();
    }, []);

    async function loadGroups() {
        try {
            setLoading(true);
            
            // In a real app, you would fetch groups from your server
            // For demo purposes, we'll use mock data
            const mockGroups = [
                {
                    id: '1',
                    name: 'AI Research Team',
                    description: 'Discussing latest AI research and developments',
                    avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
                    members: [
                        { id: '1', name: 'Alice Johnson' },
                        { id: '2', name: 'Bob Smith' },
                        { id: '3', name: 'Charlie Davis' }
                    ],
                    memberCount: 3,
                    unreadCount: 5,
                    lastMessage: 'Check out this new paper on transformers',
                    lastMessageSender: 'Alice Johnson',
                    lastMessageTime: new Date(Date.now() - 1800000).toISOString()
                },
                {
                    id: '2',
                    name: 'Dataset Collaboration',
                    description: 'Sharing and discussing AI training datasets',
                    avatar: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
                    members: [
                        { id: '1', name: 'Alice Johnson' },
                        { id: '4', name: 'Diana Wilson' },
                        { id: '5', name: 'Ethan Brown' }
                    ],
                    memberCount: 3,
                    unreadCount: 0,
                    lastMessage: 'I\'ve uploaded the new dataset',
                    lastMessageSender: 'Diana Wilson',
                    lastMessageTime: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: '3',
                    name: 'Model Training Group',
                    description: 'Discussion about AI model training techniques',
                    avatar: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c',
                    members: [
                        { id: '2', name: 'Bob Smith' },
                        { id: '3', name: 'Charlie Davis' },
                        { id: '5', name: 'Ethan Brown' }
                    ],
                    memberCount: 3,
                    unreadCount: 2,
                    lastMessage: 'The new training pipeline is ready',
                    lastMessageSender: 'Bob Smith',
                    lastMessageTime: new Date(Date.now() - 7200000).toISOString()
                }
            ];
            
            setGroups(mockGroups);
            
            // If there's a group in the URL, select it
            const urlParams = new URLSearchParams(window.location.search);
            const groupId = urlParams.get('group');
            
            if (groupId) {
                const group = mockGroups.find(g => g.id === groupId);
                if (group) {
                    setSelectedGroup(group);
                }
            }
            
        } catch (error) {
            console.error('Failed to load groups:', error);
            reportError(error);
            showError('Failed to load groups');
        } finally {
            setLoading(false);
        }
    }

    function handleSelectGroup(group) {
        setSelectedGroup(group);
        
        // Update URL without refreshing the page
        const url = new URL(window.location);
        url.searchParams.set('group', group.id);
        window.history.pushState({}, '', url);
    }

    function handleCreateGroup() {
        // In a real app, this would open a modal to create a new group
        // For demo, we'll just show a notification
        showError('This feature is not implemented in the demo');
    }

    if (!currentUser) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Please login to access group chat</h2>
                <p className="text-gray-400 mb-8">
                    You need to be logged in to view and participate in group chats.
                </p>
                <button 
                    className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold"
                    onClick={() => window.navigateTo('/login')}
                >
                    Login
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-20" data-name="group-chat-page">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Group Chats</h1>
                <p className="text-gray-400">
                    Join group discussions with other community members
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar - Groups */}
                <div className="lg:col-span-1">
                    <div className="glass-effect rounded-xl overflow-hidden h-[70vh]">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h2 className="font-semibold">Groups</h2>
                            <button 
                                className="p-2 hover:bg-white/5 rounded-full"
                                onClick={handleCreateGroup}
                            >
                                <i className="fas fa-plus"></i>
                            </button>
                        </div>
                        
                        <GroupList 
                            groups={groups}
                            onSelectGroup={handleSelectGroup}
                            selectedGroupId={selectedGroup?.id}
                        />
                    </div>
                </div>
                
                {/* Main Chat Area */}
                <div className="lg:col-span-3">
                    <div className="glass-effect rounded-xl overflow-hidden h-[70vh]">
                        {selectedGroup ? (
                            <GroupChat 
                                group={selectedGroup}
                                currentUser={currentUser}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <i className="fas fa-users text-4xl text-gray-500"></i>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Select a group to start chatting</h3>
                                <p className="text-gray-400 max-w-md mb-6">
                                    Join group discussions, share knowledge, and collaborate with other community members.
                                </p>
                                <button 
                                    className="bg-primary-main hover:bg-primary-dark px-6 py-2 rounded-lg"
                                    onClick={handleCreateGroup}
                                >
                                    Create New Group
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Group Chat Features */}
            <div className="mt-8 glass-effect rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Group Chat Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-start">
                            <i className="fas fa-video text-primary-light mt-1 mr-2"></i>
                            <div>
                                <h3 className="font-medium">Video Conferencing</h3>
                                <p className="text-sm text-gray-400">
                                    Start group video calls with up to 10 participants simultaneously.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-start">
                            <i className="fas fa-share-alt text-primary-light mt-1 mr-2"></i>
                            <div>
                                <h3 className="font-medium">File Sharing</h3>
                                <p className="text-sm text-gray-400">
                                    Share files, documents, and media with group members securely.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-start">
                            <i className="fas fa-users-cog text-primary-light mt-1 mr-2"></i>
                            <div>
                                <h3 className="font-medium">Group Management</h3>
                                <p className="text-sm text-gray-400">
                                    Manage members, roles, and permissions within your groups.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
