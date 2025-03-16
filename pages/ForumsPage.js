function ForumsPage() {
    try {
        const [posts, setPosts] = React.useState([]);
        const [categories, setCategories] = React.useState([]);
        const [loading, setLoading] = React.useState(true);
        const [selectedCategory, setSelectedCategory] = React.useState('all');
        const [showCreatePost, setShowCreatePost] = React.useState(false);
        const { currentUser } = useAuth();
        const { success, error: showError } = useNotification();

        React.useEffect(() => {
            loadForumData();
        }, [selectedCategory]);

        async function loadForumData() {
            try {
                setLoading(true);
                
                // Sample categories
                const sampleCategories = [
                    { id: 'announcements', name: 'Announcements', icon: 'fa-bullhorn' },
                    { id: 'general', name: 'General Discussion', icon: 'fa-comments' },
                    { id: 'ai-models', name: 'AI Models', icon: 'fa-robot' },
                    { id: 'blockchain', name: 'Blockchain & Web3', icon: 'fa-link' },
                    { id: 'governance', name: 'Governance', icon: 'fa-landmark' },
                    { id: 'dev', name: 'Development', icon: 'fa-code' },
                    { id: 'showcase', name: 'Showcase', icon: 'fa-desktop' },
                    { id: 'help', name: 'Help & Support', icon: 'fa-life-ring' }
                ];
                
                // Sample posts
                const samplePosts = [
                    {
                        id: '1',
                        title: 'Welcome to the JoyNet Community Forums!',
                        content: 'Welcome to our community! This is a space for discussing AI models, blockchain technology, and everything related to JoyNet. Please be respectful and follow our community guidelines.',
                        category: 'announcements',
                        author: {
                            id: 'admin',
                            username: 'JoyNet_Admin',
                            avatar: 'https://avatars.dicebear.com/api/jdenticon/admin.svg'
                        },
                        createdAt: '2023-06-01T10:00:00Z',
                        likes: 42,
                        liked: false,
                        pinned: true,
                        tags: ['welcome', 'community', 'guidelines'],
                        replies: [
                            {
                                author: {
                                    id: 'user1',
                                    username: 'AI_Enthusiast',
                                    avatar: 'https://avatars.dicebear.com/api/jdenticon/user1.svg'
                                },
                                content: 'Excited to be part of this community! Looking forward to collaborating with everyone.',
                                createdAt: '2023-06-01T10:30:00Z'
                            },
                            {
                                author: {
                                    id: 'user2',
                                    username: 'BlockchainDev',
                                    avatar: 'https://avatars.dicebear.com/api/jdenticon/user2.svg'
                                },
                                content: 'Great initiative! The intersection of AI and blockchain is fascinating.',
                                createdAt: '2023-06-01T11:15:00Z'
                            }
                        ]
                    },
                    {
                        id: '2',
                        title: 'How to stake JOY tokens and participate in governance',
                        content: 'I\'ve been exploring the platform and I\'m interested in staking my JOY tokens to participate in governance. What\'s the minimum amount required to stake? And how do I vote on proposals? Any help would be appreciated!',
                        category: 'governance',
                        author: {
                            id: 'user3',
                            username: 'CryptoNewbie',
                            avatar: 'https://avatars.dicebear.com/api/jdenticon/user3.svg'
                        },
                        createdAt: '2023-06-05T14:20:00Z',
                        likes: 15,
                        liked: false,
                        tags: ['staking', 'governance', 'JOY', 'tokens'],
                        replies: [
                            {
                                author: {
                                    id: 'user4',
                                    username: 'TokenExpert',
                                    avatar: 'https://avatars.dicebear.com/api/jdenticon/user4.svg'
                                },
                                content: 'There\'s no minimum amount to stake, but your voting power is proportional to your stake. To vote, go to the Governance section in your dashboard and you\'ll see all active proposals there.',
                                createdAt: '2023-06-05T15:10:00Z'
                            }
                        ]
                    },
                    {
                        id: '3',
                        title: 'Introducing my new language model - MultiLingua-1',
                        content: 'After months of training, I\'m excited to share my specialized language model that can translate between 50 languages with near-human accuracy. It\'s available on the marketplace now. Check it out and let me know what you think!',
                        category: 'showcase',
                        author: {
                            id: 'user5',
                            username: 'AIResearcher',
                            avatar: 'https://avatars.dicebear.com/api/jdenticon/user5.svg'
                        },
                        createdAt: '2023-06-10T09:45:00Z',
                        likes: 28,
                        liked: true,
                        image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d',
                        tags: ['language-model', 'translation', 'multilingual', 'showcase'],
                        replies: []
                    }
                ];
                
                // Filter posts by category if needed
                const filteredPosts = selectedCategory === 'all' 
                    ? samplePosts 
                    : samplePosts.filter(post => post.category === selectedCategory);
                
                setCategories(sampleCategories);
                setPosts(filteredPosts);
            } catch (error) {
                console.error("Failed to load forum data:", error);
                reportError(error);
                showError('Failed to load forum data');
            } finally {
                setLoading(false);
            }
        }

        // Add the missing functions
        async function handleCreatePost(postData) {
            try {
                // In a real app, this would call an API to create a post
                console.log("Creating post:", postData);
                
                // Create a new post object
                const newPost = {
                    id: `post-${Date.now()}`,
                    title: postData.title,
                    content: postData.content,
                    category: postData.category,
                    author: {
                        id: currentUser?.id || 'guest',
                        username: currentUser?.displayName || 'Guest User',
                        avatar: currentUser?.avatar || 'https://avatars.dicebear.com/api/jdenticon/guest.svg'
                    },
                    createdAt: new Date().toISOString(),
                    likes: 0,
                    liked: false,
                    tags: postData.tags || [],
                    replies: []
                };
                
                // Add the new post to the state
                setPosts(prevPosts => [newPost, ...prevPosts]);
                
                // Hide the create post form
                setShowCreatePost(false);
                
                // Show success message
                success('Post created successfully!');
            } catch (error) {
                console.error("Failed to create post:", error);
                reportError(error);
                showError('Failed to create post');
            }
        }

        async function handleReplyToPost(postId, replyContent) {
            try {
                // In a real app, this would call an API to add a reply
                console.log("Adding reply to post:", postId, replyContent);
                
                // Create a new reply object
                const newReply = {
                    author: {
                        id: currentUser?.id || 'guest',
                        username: currentUser?.displayName || 'Guest User',
                        avatar: currentUser?.avatar || 'https://avatars.dicebear.com/api/jdenticon/guest.svg'
                    },
                    content: replyContent,
                    createdAt: new Date().toISOString()
                };
                
                // Add the reply to the post
                setPosts(prevPosts => 
                    prevPosts.map(post => 
                        post.id === postId 
                            ? { ...post, replies: [...post.replies, newReply] }
                            : post
                    )
                );
                
                // Show success message
                success('Reply added successfully!');
                
                return true;
            } catch (error) {
                console.error("Failed to add reply:", error);
                reportError(error);
                showError('Failed to add reply');
                return false;
            }
        }

        async function handleLikePost(postId) {
            try {
                // In a real app, this would call an API to like/unlike a post
                console.log("Toggling like for post:", postId);
                
                // Toggle the like status and update the like count
                setPosts(prevPosts => 
                    prevPosts.map(post => {
                        if (post.id === postId) {
                            const newLiked = !post.liked;
                            const likeDelta = newLiked ? 1 : -1;
                            return { 
                                ...post, 
                                liked: newLiked,
                                likes: post.likes + likeDelta
                            };
                        }
                        return post;
                    })
                );
                
                return true;
            } catch (error) {
                console.error("Failed to like/unlike post:", error);
                reportError(error);
                showError('Failed to update like status');
                return false;
            }
        }

        return (
            <div className="container mx-auto px-4 py-20" data-name="forums-page">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Community Forums</h1>
                    {currentUser && (
                        <Button 
                            variant="primary"
                            onClick={() => setShowCreatePost(!showCreatePost)}
                            data-name="create-post-button"
                        >
                            {showCreatePost ? 'Cancel' : 'Create New Post'}
                        </Button>
                    )}
                </div>
                
                {/* Create Post Form */}
                {showCreatePost && (
                    <div className="mb-8" data-name="create-post-container">
                        <CreatePostForm 
                            onSubmit={handleCreatePost}
                            categories={categories}
                        />
                    </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="glass-effect rounded-xl p-4 sticky top-24" data-name="forum-sidebar">
                            <h2 className="text-xl font-semibold mb-4">Categories</h2>
                            <ul className="space-y-1">
                                <li>
                                    <button 
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                                            selectedCategory === 'all' 
                                                ? 'bg-primary-main text-white' 
                                                : 'hover:bg-white/5'
                                        }`}
                                        onClick={() => setSelectedCategory('all')}
                                        data-name="category-all"
                                    >
                                        <i className="fas fa-layer-group mr-3"></i>
                                        <span>All Categories</span>
                                    </button>
                                </li>
                                {categories.map(category => (
                                    <li key={category.id}>
                                        <button 
                                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                                                selectedCategory === category.id 
                                                    ? 'bg-primary-main text-white' 
                                                    : 'hover:bg-white/5'
                                            }`}
                                            onClick={() => setSelectedCategory(category.id)}
                                            data-name={`category-${category.id}`}
                                        >
                                            <i className={`fas ${category.icon} mr-3`}></i>
                                            <span>{category.name}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="spinner"></div>
                            </div>
                        ) : (
                            <div className="space-y-6" data-name="forum-posts">
                                {/* Pinned Posts */}
                                {posts.filter(post => post.pinned).length > 0 && (
                                    <div className="mb-6" data-name="pinned-posts">
                                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                                            <i className="fas fa-thumbtack text-primary-light mr-2"></i>
                                            Pinned Posts
                                        </h2>
                                        {posts.filter(post => post.pinned).map(post => (
                                            <ForumPost 
                                                key={post.id}
                                                post={post}
                                                onReply={handleReplyToPost}
                                                onLike={handleLikePost}
                                            />
                                        ))}
                                    </div>
                                )}
                                
                                {/* Regular Posts */}
                                <div data-name="regular-posts">
                                    <h2 className="text-lg font-semibold mb-4">
                                        {selectedCategory === 'all' ? 'Recent Posts' : `Posts in ${categories.find(c => c.id === selectedCategory)?.name || selectedCategory}`}
                                    </h2>
                                    {posts.filter(post => !post.pinned).map(post => (
                                        <ForumPost 
                                            key={post.id}
                                            post={post}
                                            onReply={handleReplyToPost}
                                            onLike={handleLikePost}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("ForumsPage render error:", error);
        reportError(error);
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Error Loading Forums</h2>
                <p className="text-gray-400 mb-8">There was an error loading the community forums.</p>
                <button 
                    className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }
}
