function CaseStudiesPage() {
    const caseStudies = [
        {
            id: 1,
            title: "AI-Powered Medical Diagnosis",
            company: "HealthTech Solutions",
            industry: "Healthcare",
            image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
            challenge: "Developing accurate diagnosis models for rare diseases",
            solution: "Implemented custom AI model with 95% accuracy",
            results: [
                "50% faster diagnosis time",
                "30% cost reduction",
                "95% accuracy rate"
            ]
        },
        {
            id: 2,
            title: "Automated Content Moderation",
            company: "SocialConnect",
            industry: "Social Media",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
            challenge: "Scaling content moderation for millions of posts",
            solution: "Deployed AI model for real-time content analysis",
            results: [
                "90% reduction in manual review",
                "99.9% uptime",
                "24/7 automated monitoring"
            ]
        }
    ];

    return (
        <div className="pt-20 pb-12" data-name="case-studies">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Case Studies</h1>
                    <p className="text-gray-400">
                        Learn how organizations are transforming their operations with AI models from JoyNet
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {caseStudies.map(study => (
                        <div 
                            key={study.id}
                            className="glass-effect rounded-xl overflow-hidden"
                            data-name={`case-study-${study.id}`}
                        >
                            <div className="aspect-video">
                                <img 
                                    src={study.image} 
                                    alt={study.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-400">{study.industry}</span>
                                    <span className="text-sm font-semibold">{study.company}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-4">{study.title}</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Challenge</h4>
                                        <p>{study.challenge}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Solution</h4>
                                        <p>{study.solution}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Results</h4>
                                        <ul className="list-disc list-inside">
                                            {study.results.map((result, index) => (
                                                <li key={index} className="text-sm">{result}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <button className="mt-6 bg-primary-main hover:bg-primary-dark px-6 py-2 rounded-lg text-sm font-semibold">
                                    Read Full Case Study
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
