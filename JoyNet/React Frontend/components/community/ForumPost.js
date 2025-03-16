function ForumPost({ post, onReply, onLike }) {
    const [showReplies, setShowReplies] = React.useState(false);
    const [replyContent, setReplyContent] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { currentUser } = useAuth();
    const { success, error: showError } = useNotification();

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        try {
            setIsSubmitting(true);
            await onReply(post.id, replyContent);
            setReplyContent('');
            success('Reply posted successfully');
            setShowReplies(true);
        } catch (error) {
            showError('Failed to post reply');
            reportError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLike = async () => {
        try {
            await onLike(post.id);
        } catch (error) {
            showError('Failed to like post');
            reportError(error);
        }
    };

    return (
        <div className="glass-effect rounded-xl p-6 mb-6" data-name="forum-post">
            <div className="flex items-start space-x-4" data-name="post-header">
                <img 
                    src={post.author.avatar} 
                    alt={post.author.username} 
                    className="w-12 h-12 rounded-full object-cover"
                    data-name="author-avatar"
                />
                <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold" data-name="author-name">{post.author.username}</h3>
                        <span className="text-sm text-gray-400" data-name="post-date">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold mb-2" data-name="post-title">{post.title}</h2>
                    <div className="mb-4 text-gray-300" data-name="post-content">{post.content}</div>
                    
                    {post.image && (
                        <div className="mb-4" data-name="post-image">
                            <img 
                                src={post.image} 
                                alt="Post attachment" 
                                className="max-h-96 rounded-lg"
                            />
                        </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-4" data-name="post-tags">
                        {post.tags?.map((tag, index) => (
                            <span 
                                key={index} 
                                className="bg-white/5 px-2 py-1 rounded-full text-xs"
                                data-name={`tag-${tag.replace(/\s+/g, '-').toLowerCase()}`}
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                    
                    <div className="flex space-x-4 text-sm" data-name="post-actions">
                        <button 
                            className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
                            onClick={handleLike}
                            data-name="like-button"
                        >
                            <i className={`${post.liked ? 'fas text-primary-light' : 'far'} fa-heart`}></i>
                            <span>{post.likes} likes</span>
                        </button>
                        <button 
                            className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
                            onClick={() => setShowReplies(!showReplies)}
                            data-name="replies-toggle"
                        >
                            <i className="far fa-comment"></i>
                            <span>{post.replies?.length || 0} replies</span>
                        </button>
                        <button 
                            className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
                            data-name="share-button"
                        >
                            <i className="far fa-share-square"></i>
                            <span>Share</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {showReplies && (
                <div className="mt-6 pl-16" data-name="replies-section">
                    <h4 className="font-semibold mb-4">Replies</h4>
                    
                    {post.replies?.length > 0 ? (
                        <div className="space-y-4 mb-4" data-name="replies-list">
                            {post.replies.map((reply, index) => (
                                <div 
                                    key={index} 
                                    className="bg-white/5 rounded-lg p-4"
                                    data-name={`reply-${index}`}
                                >
                                    <div className="flex items-center space-x-2 mb-2">
                                        <img 
                                            src={reply.author.avatar} 
                                            alt={reply.author.username} 
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <span className="font-medium">{reply.author.username}</span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(reply.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-300">{reply.content}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-400" data-name="no-replies">
                            No replies yet. Be the first to reply!
                        </div>
                    )}
                    
                    {currentUser && (
                        <form onSubmit={handleSubmitReply} className="mt-4" data-name="reply-form">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write your reply..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white min-h-[100px]"
                                required
                            ></textarea>
                            <div className="flex justify-end mt-2">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={isSubmitting}
                                    disabled={isSubmitting || !replyContent.trim()}
                                >
                                    Post Reply
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
