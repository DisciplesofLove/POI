function ChallengesPage() {
    const challenges = [
        {
            id: 1,
            title: "AI Image Generation Challenge",
            description: "Create the most innovative image generation model",
            prize: "$10,000",
            participants: 234,
            deadline: "2024-03-15",
            difficulty: "Advanced",
            image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e",
            requirements: [
                "Experience with GANs",
                "Knowledge of PyTorch",
                "Portfolio of previous work"
            ],
            sponsor: "TechCorp AI"
        },
        {
            id: 2,
            title: "Natural Language Processing Competition",
            description: "Build the most accurate sentiment analysis model",
            prize: "$5,000",
            participants: 156,
            deadline: "2024-04-01",
            difficulty: "Intermediate",
            image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d",
            requirements: [
                "NLP experience",
                "Machine learning background",
                "Data preprocessing skills"
            ],
            sponsor: "AI Research Lab"
        }
    ];

    return (
        <div className="pt-20 pb-12" data-name="challenges">
            <div className="container mx-auto px-4">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">AI Challenges</h1>
                    <p className="text-gray-400">
                        Participate in exciting AI challenges and compete for prizes
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <button className="px-4 py-2 rounded-full bg-primary-main text-white">
                        All Challenges
                    </button>
                    <button className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10">
                        Active
                    </button>
                    <button className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10">
                        Upcoming
                    </button>
                    <button className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10">
                        Past
                    </button>
                </div>

                {/* Challenges Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {challenges.map(challenge => (
                        <div 
                            key={challenge.id}
                            className="glass-effect rounded-xl overflow-hidden"
                            data-name={`challenge-${challenge.id}`}
                        >
                            <div className="aspect-video">
                                <img 
                                    src={challenge.image}
                                    alt={challenge.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-bold">{challenge.title}</h3>
                                    <span className="bg-primary-main/20 text-primary-light px-3 py-1 rounded-full text-sm">
                                        {challenge.difficulty}
                                    </span>
                                </div>
                                <p className="text-gray-400 mb-6">{challenge.description}</p>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <p className="text-sm text-gray-400">Prize Pool</p>
                                        <p className="text-xl font-bold">{challenge.prize}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <p className="text-sm text-gray-400">Participants</p>
                                        <p className="text-xl font-bold">{challenge.participants}</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="font-semibold mb-2">Requirements:</h4>
                                    <ul className="list-disc list-inside text-gray-400">
                                        {challenge.requirements.map((req, index) => (
                                            <li key={index}>{req}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                    <div>
                                        <p className="text-sm text-gray-400">Sponsored by</p>
                                        <p className="font-semibold">{challenge.sponsor}</p>
                                    </div>
                                    <button className="bg-primary-main hover:bg-primary-dark px-6 py-2 rounded-lg">
                                        Join Challenge
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Challenge CTA */}
                <div className="mt-12 text-center">
                    <h2 className="text-2xl font-bold mb-4">Have an Idea for a Challenge?</h2>
                    <p className="text-gray-400 mb-6">
                        Create your own AI challenge and engage with our community of developers
                    </p>
                    <button className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold">
                        Create Challenge
                    </button>
                </div>
            </div>
        </div>
    );
}
