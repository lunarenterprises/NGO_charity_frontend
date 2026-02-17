import React from 'react';
import { useNavigate } from 'react-router-dom';

const CompletedProjects = () => {
    const navigate = useNavigate();

    const completedProjects = [
        {
            id: 101,
            category: "Healthcare",
            title: "Village Clinic Construction",
            description: "Successfully built and equipped a primary healthcare center serving 5,000 residents in tribal areas.",
            impact: "5,000+ People Served",
            date: "Completed Jan 2024",
            image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 102,
            category: "Education",
            title: "Digital Literacy Drive",
            description: "Distributed 500 tablets and set up computer labs in 15 government schools to bridge the digital divide.",
            impact: "500 Students Empowered",
            date: "Completed Nov 2023",
            image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 103,
            category: "Environment",
            title: "Check Dam Project",
            description: "Restored groundwater levels by constructing 5 check dams in drought-prone regions.",
            impact: "10 Villages Benefited",
            date: "Completed Sept 2023",
            image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        }
    ];

    return (
        <div className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <span className="bg-gray-100 text-black px-4 py-1.5 rounded-full text-sm font-medium">
                            Success Stories
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-black mt-4">
                            Completed Projects
                        </h2>
                        <p className="text-gray-600 mt-4 max-w-2xl">
                            Witness the tangible impact of your generosity. These projects have reached their goals and are now transforming lives.
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={() => navigate('/completed-projects')}
                            className="inline-flex items-center gap-2 text-black font-semibold hover:underline transition-colors"
                        >
                            View All Success Stories
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {completedProjects.map((project, index) => (
                        <div key={index} className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex flex-col hover:border-gray-300 transition-colors">
                            {/* Image Section */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    {project.category}
                                </div>
                                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1 rounded-md">
                                    {project.date}
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-6 flex flex-col grow">
                                <h3 className="text-lg font-bold text-black mb-2">
                                    {project.title}
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 grow">
                                    {project.description}
                                </p>

                                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-black">
                                                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-bold text-black">{project.impact}</span>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/project/${project.id}`)}
                                        className="text-sm text-black font-medium hover:underline"
                                    >
                                        Read Story
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CompletedProjects;
