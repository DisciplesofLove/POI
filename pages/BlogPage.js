function BlogPage() {
    const blogPosts = [
        {
            id: 1,
            title: "The Future of AI Model Development",
            excerpt: "Exploring upcoming trends in AI model development and what it means for developers",
            author: {
                name: "Dr. Sarah Chen",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
                role: "AI Research Director"
            },
            date: "2024-01-15",
            readTime: "8 min read",
            image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
            category: "Technology",
            tags: ["AI", "Machine Learning", "Future Tech"]
        },
        {
            id: 2,
            title: "Best Practices for Model Training",
            excerpt: "Essential tips and techniques for training high-performance AI models",
            author: {
                name: "Michael Wong",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
                role: "Senior ML Engineer"
            },
            date: "2024-01-12",
            readTime: "6 min read",
            image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c",
            category: "Tutorial",
            tags: ["Training", "Best Practices", "ML"]
        }
    ];

    const categories = [
        "All",
        "Technology",
        "Tutorial",
        "Case Study",
        "Research",
        "News"
    ];

    return (
        <div className="pt-20 pb-12" data-name="blog">
            <div className="container mx-auto px-4">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">Blog</h1>
                    <p className="text-gray-400">
                        Insights, tutorials, and news from the AI community
                    </p>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-4 mb-8">
                    {categories.map((category, index) => (
                        <button
                            key={index}
                            className={`px-4 py-2 rounded-full ${
                                index === 0 
                                    ? 'bg-primary-main text-white'
                                    : 'bg-white/5 hover:bg-white/10'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Featured Post */}
                <div className="glass-effect rounded-xl overflow-hidden mb-12">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="aspect-video md:aspect-auto">
                            <img 
                                src={blogPosts[0].image}
                                alt={blogPosts[0].title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-6 flex flex-col justify-center">
                            <div className="flex items-center mb-4">
                                <span className="bg-primary-main/20 text-primary-light px-3 py-1 rounded-full text-sm">
                                    {blogPosts[0].category}
                                </span>
                                <span className="text-gray-400 text-sm ml-4">
                                    {blogPosts[0].readTime}
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold mb-4">{blogPosts[0].title}</h2>
                            <p className="text-gray-400 mb-6">{blogPosts[0].excerpt}</p>
                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center">
                                    <img 
                                        src={blogPosts[0].author.avatar}
                                        alt={blogPosts[0].author.name}
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                    <div>
                                        <p className="font-semibold">{blogPosts[0].author.name}</p>
                                        <p className="text-sm text-gray-400">{blogPosts[0].author.role}</p>
                                    </div>
                                </div>
                                <button className="bg-primary-main hover:bg-primary-dark px-6 py-2 rounded-lg">
                                    Read More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Blog Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPosts.map(post => (
                        <div 
                            key={post.id}
                            className="glass-effect rounded-xl overflow-hidden"
                            data-name={`blog-post-${post.id}`}
                        >
                            <div className="aspect-video">
                                <img 
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <span className="bg-primary-main/20 text-primary-light px-3 py-1 rounded-full text-sm">
                                        {post.category}
                                    </span>
                                    <span className="text-gray-400 text-sm ml-4">
                                        {post.readTime}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                                <p className="text-gray-400 mb-4">{post.excerpt}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.tags.map((tag, index) => (
                                        <span 
                                            key={index}
                                            className="bg-white/5 px-3 py-1 rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <div className="flex items-center">
                                        <img 
                                            src={post.author.avatar}
                                            alt={post.author.name}
                                            className="w-8 h-8 rounded-full mr-2"
                                        />
                                        <p className="text-sm">{post.author.name}</p>
                                    </div>
                                    <span className="text-sm text-gray-400">
                                        {new Date(post.date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More */}
                <div className="mt-12 text-center">
                    <button className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-lg">
                        Load More Posts
                    </button>
                </div>
            </div>
        </div>
    );
}
