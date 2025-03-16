function MembersPage() {
    const members = [
        {
            id: 1,
            name: "Alex Thompson",
            role: "AI Researcher",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
            contributions: 156,
            reputation: 4.9,
            models: 12,
            specialty: "NLP",
            joined: "2023-01-15"
        },
        {
            id: 2,
            name: "Sarah Chen",
            role: "ML Engineer",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
            contributions: 243,
            reputation: 4.8,
            models: 18,
            specialty: "Computer Vision",
            joined: "2023-02-20"
        },
        {
            id: 3,
            name: "David Kim",
            role: "Data Scientist",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
            contributions: 189,
            reputation: 4.7,
            models: 15,
            specialty: "Deep Learning",
            joined: "2023-03-10"
        }
    ];

    return (
        <div className="pt-20 pb-12" data-name="members">
            <div className="container mx-auto px-4">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">Community Members</h1>
                    <p className="text-gray-400">
                        Meet our talented community of AI researchers, engineers, and data scientists
                    </p>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button className="px-4 py-2 rounded-full bg-primary-main text-white">
                            All Members
                        </button>
                        <button className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10">
                            Top Contributors
                        </button>
                        <button className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10">
                            Recent Joins
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search members..."
                            className="w-full md:w-64 bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2"
                        />
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>

                {/* Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map(member => (
                        <div 
                            key={member.id} 
                            className="glass-effect rounded-xl p-6"
                            data-name={`member-${member.id}`}
                        >
                            <div className="flex items-center mb-6">
                                <img 
                                    src={member.avatar}
                                    alt={member.name}
                                    className="w-16 h-16 rounded-full mr-4"
                                />
                                <div>
                                    <h3 className="text-lg font-semibold">{member.name}</h3>
                                    <p className="text-gray-400">{member.role}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white/5 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold">{member.contributions}</p>
                                    <p className="text-sm text-gray-400">Contributions</p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold">{member.models}</p>
                                    <p className="text-sm text-gray-400">Models</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Specialty</span>
                                    <span>{member.specialty}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Reputation</span>
                                    <span className="flex items-center">
                                        <i className="fas fa-star text-yellow-500 mr-1"></i>
                                        {member.reputation}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Joined</span>
                                    <span>{new Date(member.joined).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button className="bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg">
                                    View Profile
                                </button>
                                <button className="border border-white/20 hover:border-white/40 px-4 py-2 rounded-lg">
                                    Follow
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More */}
                <div className="mt-12 text-center">
                    <button className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-lg">
                        Load More Members
                    </button>
                </div>
            </div>
        </div>
    );
}
