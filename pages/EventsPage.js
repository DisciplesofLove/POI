function EventsPage() {
    const events = [
        {
            id: 1,
            title: "AI Summit 2024",
            description: "Annual conference on artificial intelligence and machine learning",
            date: "2024-05-15",
            time: "9:00 AM - 6:00 PM",
            location: "Virtual & San Francisco",
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
            type: "Conference",
            price: "Free - $499",
            speakers: [
                { name: "Dr. Sarah Chen", role: "AI Research Director" },
                { name: "John Smith", role: "ML Engineering Lead" }
            ],
            attendees: 1200
        },
        {
            id: 2,
            title: "Deep Learning Workshop",
            description: "Hands-on workshop on advanced deep learning techniques",
            date: "2024-04-20",
            time: "10:00 AM - 4:00 PM",
            location: "Virtual",
            image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7",
            type: "Workshop",
            price: "$199",
            speakers: [
                { name: "Dr. Michael Wong", role: "Deep Learning Expert" }
            ],
            attendees: 150
        }
    ];

    return (
        <div className="pt-20 pb-12" data-name="events">
            <div className="container mx-auto px-4">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">AI Events & Workshops</h1>
                    <p className="text-gray-400">
                        Join our community events, workshops, and conferences
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <button className="px-4 py-2 rounded-full bg-primary-main text-white">
                        All Events
                    </button>
                    <button className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10">
                        Conferences
                    </button>
                    <button className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10">
                        Workshops
                    </button>
                    <button className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10">
                        Meetups
                    </button>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map(event => (
                        <div 
                            key={event.id}
                            className="glass-effect rounded-xl overflow-hidden"
                            data-name={`event-${event.id}`}
                        >
                            <div className="aspect-video">
                                <img 
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-bold">{event.title}</h3>
                                    <span className="bg-primary-main/20 text-primary-light px-3 py-1 rounded-full text-sm">
                                        {event.type}
                                    </span>
                                </div>
                                <p className="text-gray-400 mb-6">{event.description}</p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center">
                                        <i className="far fa-calendar-alt w-6 text-primary-main"></i>
                                        <span>{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <i className="far fa-clock w-6 text-primary-main"></i>
                                        <span>{event.time}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <i className="fas fa-map-marker-alt w-6 text-primary-main"></i>
                                        <span>{event.location}</span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="font-semibold mb-2">Speakers:</h4>
                                    <div className="space-y-2">
                                        {event.speakers.map((speaker, index) => (
                                            <div key={index} className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-primary-main/20 flex items-center justify-center mr-2">
                                                    <i className="fas fa-user"></i>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{speaker.name}</p>
                                                    <p className="text-sm text-gray-400">{speaker.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                    <div>
                                        <p className="text-sm text-gray-400">Price</p>
                                        <p className="font-semibold">{event.price}</p>
                                    </div>
                                    <button className="bg-primary-main hover:bg-primary-dark px-6 py-2 rounded-lg">
                                        Register Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Host Event CTA */}
                <div className="mt-12 text-center">
                    <h2 className="text-2xl font-bold mb-4">Host Your Own Event</h2>
                    <p className="text-gray-400 mb-6">
                        Share your knowledge with the community by hosting an event
                    </p>
                    <button className="bg-primary-main hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold">
                        Host Event
                    </button>
                </div>
            </div>
        </div>
    );
}
