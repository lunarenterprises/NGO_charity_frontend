import React from 'react';
import { useParams, Link } from 'react-router-dom';

const ProjectDetails = () => {
    const { id } = useParams();

    // Mock data - in a real app, fetch this based on ID
    const project = {
        id: id,
        title: "Clean Water for Villages",
        description: "Providing clean drinking water to 50 remote villages in rural Maharashtra through sustainable well construction. This project aims to reduce waterborne diseases and improve the overall quality of life for over 10,000 villagers. We are working closely with local communities to ensure the long-term maintenance and sustainability of these water sources.",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder video
        raised: "₹3,25,000",
        target: "₹5,00,000",
        progress: 65,
        category: "Water & Sanitation"
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pt-20">

            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Video Section */}
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl mb-12 bg-black">
                    <iframe
                        width="100%"
                        height="100%"
                        src={project.videoUrl}
                        title="Project Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2">
                        <span className="inline-block bg-gray-100 text-black px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                            {project.category}
                        </span>
                        <h1 className="text-4xl font-bold text-black mb-6">{project.title}</h1>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            {project.description}
                        </p>

                        <div className="bg-white p-6 rounded-xl border border-gray-100">
                            <h3 className="text-xl font-bold mb-4">About this Project</h3>
                            <p className="text-gray-600">
                                Detailed background information about the project would go here. explaining the problem, the solution, and the impact validation.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Donation Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-2xl shadow-lg sticky top-24 border border-gray-100">
                            <div className="mb-6">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-3xl font-bold text-black">{project.raised}</span>
                                    <span className="text-gray-500 mb-1">raised of {project.target}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3">
                                    <div
                                        className="bg-black h-3 rounded-full"
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-900 transition-colors shadow-lg mb-4">
                                Donate Now
                            </button>

                            <p className="text-center text-sm text-gray-500">
                                All donations are tax-deductible.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;
