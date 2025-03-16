function ProjectsPage() {
    const projects = [
        {
            id: 1,
            title: "Open Source AI Vision Library",
            description: "A comprehensive computer vision library with pre-trained models",
            image: "https://images.unsplash.com/photo-1527430253228-e93688616381",
            category: "Computer Vision",
            stars: 1245,
            forks: 324,
            contributors: 45,
            tech: ["Python", "PyTorch", "OpenCV"],
            status: "Active"
        },
        {
            id: 2,
            title: "Neural Network Training Framework",
            description: "Efficient and scalable framework for training deep learning models",
            image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
            category: "Deep Learning",
            stars: 892,
            forks: 156,
            contributors: 28,
            tech: ["Python", "TensorFlow", "CUDA"],
            status: "Active"
        }
    ];

    return (
        <div className="pt-20 pb-12" data-name="projects">
            <div className="container mx-auto px-4">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">Open Source Projects</h1>
                    <p className="text-gray-400">
                        Explore and contribute to community-driven AI projects
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <button className="px-4 py-2 rounded-full bg-primary-main text-white">
                        All Projects
                    </button>
                    <button className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10">
                        Most Popular
                    </button>
                    <button className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10">
                        Recently Updated
                    </button>
                    <button className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10">
                        Looking for Contributors
                    </button>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map(project => (
                        <div 
                            key={project.id}
                            className="glass-effect rounded-xl overflow-hidden"
                            data-name={`project-${project.id}`}
                        >
                            <div className="aspect-video">
                                <img 
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-bold">{project.title}</h3>
                                    <span className="bg-success-main/20 text-success-light px-3 py-1 rounded-full text-sm">
                                        {project.status}
                                    </span>
                                </div>
                                <p className="text-gray-400 mb-6">{project.description}</p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {project.tech.map((tech, index) => (
                                        <span 
                                            key={index}
                                            className="bg-white/5 px-3 py-1 rounded-full text-sm"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{project.stars}</p>
                                        <p className="text-sm text-gray-400">Stars</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{project.forks}</p>
                                        <p className="text-sm text-gray-400">Forks</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{project.contributors}</p>
                                        <p className="text-sm text-gray-400">Contributors</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                    <span className="text-gray-400">{project.category}</span>
                                    <div className="space-x-4">
                                        <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg">
                                            Fork
                                        </button>
                                        <button className="bg-primary-main hover:bg-primary-dark px-4 py-2 rounded-lg">
                                            View Project
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Project CTA */}
                <div className="mt-12 text-center">
                    <h2 className="text-2xl font-bold mb-4">Start Your Own Project</h2>
                    <p className="text-gray-400 mb-6">
                        Share your AI project with the community and find collaborators
                    </p>
                    <button className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold">
                        Create Project
                    </button>
                </div>
            </div>
        </div>
    );
}
