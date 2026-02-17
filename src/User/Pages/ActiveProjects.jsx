import React from 'react';
import { useNavigate } from 'react-router-dom';

const ActiveProjects = () => {
    const navigate = useNavigate();

    const projects = [
        {
            id: 1,
            category: "Water & Sanitation",
            title: "Clean Water for Villages",
            description: "Providing clean drinking water to 50 remote villages in rural Maharashtra through sustainable well construction.",
            raised: "₹3,25,000",
            target: "₹5,00,000",
            progress: 65,
            image: "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 2,
            category: "Education",
            title: "Education for All",
            description: "Building schools and providing educational resources to underprivileged children across 10 districts.",
            raised: "₹6,82,000",
            target: "₹8,00,000",
            progress: 85,
            image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 3,
            category: "Healthcare",
            title: "Medical Camp Initiative",
            description: "Free medical camps with specialist doctors providing healthcare to communities with no hospital access.",
            raised: "₹1,85,000",
            target: "₹3,00,000",
            progress: 60,
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 4,
            category: "Hunger",
            title: "Food for Everyone",
            description: "Providing nutritious meals to street children and daily wage workers who are struggling with hunger.",
            raised: "₹1,20,000",
            target: "₹2,50,000",
            progress: 48,
            image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 5,
            category: "Environment",
            title: "Green Earth Project",
            description: "Planting 10,000 trees across urban areas to combat pollution and improve air quality for future generations.",
            raised: "₹95,000",
            target: "₹2,00,000",
            progress: 47,
            image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 6,
            category: "Empowerment",
            title: "Women's Skill Center",
            description: "Vocational training and financial literacy workshops for women to become financially independent.",
            raised: "₹2,40,000",
            target: "₹4,00,000",
            progress: 60,
            image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-12 py-10">
                    {/* <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-black font-medium hover:underline mb-6"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to Home
                    </button> */}
                    <h1 className="text-3xl md:text-5xl font-bold text-black">Active Projects</h1>
                    <p className="text-gray-600 mt-4 max-w-2xl text-lg">
                        Explore all our ongoing initiatives and see how you can make an impact today.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-12 mt-16">
                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, index) => (
                        <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col">
                            {/* Image Section */}
                            <div
                                className="relative h-56 overflow-hidden cursor-pointer group"
                                onClick={() => navigate(`/project/${project.id}`)}
                            >
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                                    {project.category}
                                </span>
                            </div>

                            {/* Content Section */}
                            <div className="p-6 flex flex-col grow">
                                <h3 className="text-xl font-bold text-black mb-2">
                                    {project.title}
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 grow">
                                    {project.description}
                                </p>

                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-black h-2 rounded-full"
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-black">{project.raised}</span>
                                        <span className="text-gray-400">of {project.target}</span>
                                    </div>
                                </div>

                                {/* Donate Button */}
                                <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                    </svg>
                                    Donate Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActiveProjects;
