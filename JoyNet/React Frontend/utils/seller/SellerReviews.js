function SellerReviews({ reviews }) {
    try {
        const [filterRating, setFilterRating] = React.useState('all');
        const [sortOrder, setSortOrder] = React.useState('newest');
        
        // Filter reviews based on rating
        const filteredReviews = filterRating === 'all' 
            ? reviews 
            : reviews.filter(review => {
                if (filterRating === '5') return review.rating === 5;
                if (filterRating === '4') return review.rating === 4;
                if (filterRating === '3') return review.rating === 3;
                if (filterRating === '1-2') return review.rating <= 2;
                return true;
            });
            
        // Sort reviews
        const sortedReviews = [...filteredReviews].sort((a, b) => {
            if (sortOrder === 'newest') {
                return new Date(b.date) - new Date(a.date);
            } else if (sortOrder === 'oldest') {
                return new Date(a.date) - new Date(b.date);
            } else if (sortOrder === 'highest') {
                return b.rating - a.rating;
            } else if (sortOrder === 'lowest') {
                return a.rating - b.rating;
            }
            return 0;
        });
        
        // Calculate rating stats
        const totalReviews = reviews.length;
        const ratingCounts = {
            5: reviews.filter(r => r.rating === 5).length,
            4: reviews.filter(r => r.rating === 4).length,
            3: reviews.filter(r => r.rating === 3).length,
            2: reviews.filter(r => r.rating === 2).length,
            1: reviews.filter(r => r.rating === 1).length
        };
        
        const averageRating = totalReviews > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
            : 0;
            
        return (
            <div className="space-y-8" data-name="seller-reviews">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Rating Summary */}
                    <div className="glass-effect rounded-xl p-6 md:col-span-1">
                        <h2 className="text-xl font-semibold mb-4">Rating Summary</h2>
                        <div className="text-center mb-6">
                            <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
                            <div className="flex justify-center my-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <i key={star} className={`fas fa-star ${
                                        star <= Math.round(averageRating) ? 'text-yellow-500' : 'text-gray-600'
                                    } mx-1`}></i>
                                ))}
                            </div>
                            <div className="text-sm text-gray-400">{totalReviews} reviews</div>
                        </div>
                        
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <div key={rating} className="flex items-center">
                                    <div className="w-12 text-sm">{rating} stars</div>
                                    <div className="flex-1 mx-2">
                                        <div className="w-full bg-white/10 rounded-full h-2">
                                            <div 
                                                className="bg-yellow-500 h-2 rounded-full" 
                                                style={{ 
                                                    width: `${totalReviews ? (ratingCounts[rating] / totalReviews) * 100 : 0}%` 
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="w-8 text-right text-sm">{ratingCounts[rating]}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Reviews List */}
                    <div className="glass-effect rounded-xl p-6 md:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Customer Reviews</h2>
                            <div className="flex space-x-2">
                                <select
                                    value={filterRating}
                                    onChange={(e) => setFilterRating(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm"
                                >
                                    <option value="all">All Ratings</option>
                                    <option value="5">5 Stars</option>
                                    <option value="4">4 Stars</option>
                                    <option value="3">3 Stars</option>
                                    <option value="1-2">1-2 Stars</option>
                                </select>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="highest">Highest Rating</option>
                                    <option value="lowest">Lowest Rating</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            {sortedReviews.length > 0 ? (
                                sortedReviews.map((review) => (
                                    <ReviewItem key={review.id} review={review} />
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-400">No reviews found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Review Response Guidelines */}
                <div className="glass-effect rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Review Response Guidelines</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 p-4 rounded-lg">
                            <div className="flex items-start mb-2">
                                <div className="w-10 h-10 rounded-full bg-primary-main/20 flex items-center justify-center mr-3">
                                    <i className="fas fa-clock text-primary-light"></i>
                                </div>
                                <h3 className="font-semibold">Respond Promptly</h3>
                            </div>
                            <p className="text-sm text-gray-400">
                                Reply to customer reviews within 24-48 hours to show that you value their feedback.
                            </p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                            <div className="flex items-start mb-2">
                                <div className="w-10 h-10 rounded-full bg-success-main/20 flex items-center justify-center mr-3">
                                    <i className="fas fa-thumbs-up text-success-light"></i>
                                </div>
                                <h3 className="font-semibold">Be Professional</h3>
                            </div>
                            <p className="text-sm text-gray-400">
                                Always maintain a professional tone, even when responding to negative reviews.
                            </p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                            <div className="flex items-start mb-2">
                                <div className="w-10 h-10 rounded-full bg-warning-main/20 flex items-center justify-center mr-3">
                                    <i className="fas fa-lightbulb text-warning-light"></i>
                                </div>
                                <h3 className="font-semibold">Offer Solutions</h3>
                            </div>
                            <p className="text-sm text-gray-400">
                                For negative reviews, acknowledge the issue and offer a constructive solution.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("SellerReviews render error:", error);
        reportError(error);
        return (
            <div className="glass-effect rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                <p className="text-gray-400">There was an error loading the reviews data.</p>
            </div>
        );
    }
}

function ReviewItem({ review }) {
    const [showResponse, setShowResponse] = React.useState(false);
    const [response, setResponse] = React.useState('');
    
    const handleSubmitResponse = (e) => {
        e.preventDefault();
        // In a real app, this would send the response to an API
        alert(`Response submitted: ${response}`);
        setResponse('');
        setShowResponse(false);
    };
    
    return (
        <div className="border-b border-white/10 pb-6" data-name={`review-${review.id}`}>
            <div className="flex justify-between mb-2">
                <div className="flex items-center">
                    <div className="flex mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <i key={star} className={`fas fa-star ${
                                star <= review.rating ? 'text-yellow-500' : 'text-gray-600'
                            } text-sm`}></i>
                        ))}
                    </div>
                    <span className="font-semibold">{review.productName}</span>
                </div>
                <span className="text-sm text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
            </div>
            <p className="mb-2">{review.comment}</p>
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">By {review.customer}</span>
                <button 
                    className="text-primary-light hover:text-primary-main text-sm"
                    onClick={() => setShowResponse(!showResponse)}
                >
                    {showResponse ? 'Cancel Reply' : 'Reply'}
                </button>
            </div>
            
            {showResponse && (
                <form onSubmit={handleSubmitResponse} className="mt-4 space-y-4">
                    <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Write your response..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white h-24"
                        required
                    ></textarea>
                    <div className="flex justify-end space-x-2">
                        <button 
                            type="button" 
                            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg"
                            onClick={() => setShowResponse(false)}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg"
                        >
                            Submit Response
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
