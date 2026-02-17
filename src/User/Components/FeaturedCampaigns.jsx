import React from 'react';
import { useNavigate } from 'react-router-dom';

const FeaturedCampaigns = () => {
    const navigate = useNavigate();

    const campaigns = [
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
        }
    ];

    return (
        <div className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 md:px-12">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="bg-gray-100 text-black px-4 py-1.5 rounded-full text-sm font-medium">
                        Our Projects
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-black mt-4 mb-4">
                        Active Projects
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Support causes that matter. Every donation, big or small, brings hope to those in need.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {campaigns.map((campaign, index) => (
                        <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col">
                            {/* Image Section */}
                            <div
                                className="relative h-56 overflow-hidden cursor-pointer group"
                                onClick={() => navigate(`/project/${campaign.id || index + 1}`)}
                            >
                                <img
                                    src={campaign.image}
                                    alt={campaign.title}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                                    {campaign.category}
                                </span>

                                {/* Play Icon Overlay Hint */}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-black ml-1">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-6 flex flex-col grow">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {campaign.title}
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 grow">
                                    {campaign.description}
                                </p>

                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-black h-2 rounded-full"
                                            style={{ width: `${campaign.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-black">{campaign.raised}</span>
                                        <span className="text-gray-400">of {campaign.target}</span>
                                    </div>
                                </div>

                                {/* Donate Button */}
                                <button className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                    </svg>
                                    Donate Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-16">
                    <button
                        onClick={() => navigate('/active-projects')}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-gray-300 rounded-full font-medium text-black hover:bg-gray-50 transition-colors"
                    >
                        View All Projects
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeaturedCampaigns;
