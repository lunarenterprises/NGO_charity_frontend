import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveProjectsApi } from '../../Services/userApi';

const FeaturedCampaigns = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const res = await getActiveProjectsApi({ page: 1, limit: 3 });
                if (res?.data?.projects || res?.data?.data) {
                    setCampaigns(res.data.projects || res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch featured campaigns:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const firstImage = (project) => {
        let imgs = project.projectImages;
        if (!Array.isArray(imgs)) {
            try { imgs = JSON.parse(imgs); } catch { imgs = []; }
        }
        if (Array.isArray(imgs) && imgs.length > 0) return imgs[0];
        return "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    };

    const progressPercent = (project) => {
        const target = parseFloat(project.targetAmount) || 0;
        const current = parseFloat(project.currentAmount) || 0;
        if (target === 0) return 0;
        return Math.min(Math.round((current / target) * 100), 100);
    };

    const formatAmount = (val) => {
        const num = parseFloat(val) || 0;
        return `₹${num.toLocaleString('en-IN')}`;
    };

    return (
        <div className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 md:px-12">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="bg-gray-100 border text-black px-4 py-1.5 rounded-full text-sm font-medium">
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
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-gray-100 h-96 rounded-2xl border border-gray-100"></div>
                        ))
                    ) : campaigns.length > 0 ? (
                        campaigns.map((campaign, index) => (
                            <div key={campaign._id || campaign.id || index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col">
                                {/* Image Section */}
                                <div
                                    className="relative h-56 overflow-hidden cursor-pointer group"
                                    onClick={() => navigate(`/project/${campaign._id || campaign.id}`)}
                                >
                                    <img
                                        src={firstImage(campaign)}
                                        alt={campaign.name || campaign.title}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                                        {campaign.category || "Initiative"}
                                    </span>

                                    {/* Eye Icon Overlay Hint */}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-black">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-6 flex flex-col grow">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                        {campaign.name || campaign.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6 grow line-clamp-3">
                                        {campaign.summary || campaign.description}
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="mb-6">
                                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                            <div
                                                className="bg-black h-2 rounded-full"
                                                style={{ width: `${progressPercent(campaign)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-black">{formatAmount(campaign.currentAmount)}</span>
                                            <span className="text-gray-400">of {formatAmount(campaign.targetAmount)}</span>
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
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            No active projects found right now.
                        </div>
                    )}
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
