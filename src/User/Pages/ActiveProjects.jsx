import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveProjectsApi } from '../../Services/userApi';

const ActiveProjects = () => {
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ totalPages: 1, total: 0 });

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const res = await getActiveProjectsApi({ page, limit: 9 });
                if (res?.data?.projects || res?.data?.data) {
                    setProjects(res.data.projects || res.data.data);
                    if (res.data.meta) setMeta(res.data.meta);
                }
            } catch (err) {
                console.error("Failed to fetch active projects:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [page]);

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
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-white h-96 rounded-2xl border border-gray-100 shadow-sm"></div>
                        ))
                    ) : projects.length > 0 ? (
                        projects.map((project, index) => (
                            <div key={project._id || project.id || index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col">
                                {/* Image Section */}
                                <div
                                    className="relative h-56 overflow-hidden cursor-pointer group"
                                    onClick={() => navigate(`/project/${project._id || project.id}`)}
                                >
                                    <img
                                        src={firstImage(project)}
                                        alt={project.name || project.title}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                                        {project.category || "Initiative"}
                                    </span>
                                </div>

                                {/* Content Section */}
                                <div className="p-6 flex flex-col grow">
                                    <h3 className="text-xl font-bold text-black mb-2 line-clamp-2">
                                        {project.name || project.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6 grow line-clamp-3">
                                        {project.summary || project.description}
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="mb-6">
                                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                            <div
                                                className="bg-black h-2 rounded-full"
                                                style={{ width: `${progressPercent(project)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-black">{formatAmount(project.currentAmount)}</span>
                                            <span className="text-gray-400">of {formatAmount(project.targetAmount)}</span>
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
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No active projects found.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && meta.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-12">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium bg-white"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 border border-gray-200 rounded-lg bg-black text-white text-sm font-medium">
                            {page} / {meta.totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                            disabled={page === meta.totalPages}
                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium bg-white"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveProjects;
