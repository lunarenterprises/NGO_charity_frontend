import React from 'react';
import { useNavigate } from 'react-router-dom';

const CompletedProjectsListing = () => {
    const navigate = useNavigate();

    const historicalProjects = [
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
        },
        {
            id: 104,
            category: "Sanitation",
            title: "Public Toilet Blocks",
            description: "Built 20 hygienic public toilet blocks in busy marketplace areas to promote sanitation.",
            impact: "2,000 Daily Users",
            date: "Completed June 2023",
            image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 105,
            category: "Livelihood",
            title: "Tailoring Training Center",
            description: "Empowered 200 women with tailoring skills and provided sewing machines to start their own businesses.",
            impact: "200 Families Supported",
            date: "Completed April 2023",
            image: "https://images.unsplash.com/photo-1524230572899-a752b3835840?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 106,
            category: "Relief",
            title: "Flood Relief Habitat",
            description: "Reconstructed 50 homes for families displaced by the monsoon floods in the coastal districts.",
            impact: "50 Homes Rebuilt",
            date: "Completed Feb 2023",
            image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-18">
            {/* Header */}
            <div className="bg-black text-white">
                <div className="max-w-7xl mx-auto px-4 md:px-12 py-16">
                    {/* <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-gray-300 font-medium hover:text-white mb-8 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to Home
                    </button> */}
                    <h1 className="text-4xl md:text-5xl font-bold">Successfully Completed Projects</h1>
                    <p className="text-gray-200 mt-6 max-w-3xl text-xl leading-relaxed">
                        Every project here represents a journey of hope and transformation, made possible through your support. We take pride in sharing these success stories with you.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-12 -mt-8">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <span className="text-3xl font-bold text-black">150+</span>
                        <span className="text-gray-500 text-sm mt-1 uppercase tracking-wider font-semibold">Projects Finished</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <span className="text-3xl font-bold text-black">50,000+</span>
                        <span className="text-gray-500 text-sm mt-1 uppercase tracking-wider font-semibold">Lives Impacted</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <span className="text-3xl font-bold text-black">25+</span>
                        <span className="text-gray-500 text-sm mt-1 uppercase tracking-wider font-semibold">Districts Covered</span>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {historicalProjects.map((project, index) => (
                        <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col">
                            {/* Image Section */}
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                                    {project.category}
                                </div>
                                <div className="absolute inset-0 bg-black/20"></div>
                                <div className="absolute bottom-4 left-4 text-white">
                                    <span className="text-xs font-medium opacity-80">{project.date}</span>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-6 flex flex-col grow">
                                <h3 className="text-xl font-bold text-black mb-2">
                                    {project.title}
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 grow">
                                    {project.description}
                                </p>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-black">
                                                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Impact Made</div>
                                            <div className="text-sm font-bold text-black">{project.impact}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/project/${project.id}`)}
                                        className="w-full mt-6 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                                    >
                                        View Full Story
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

export default CompletedProjectsListing;
