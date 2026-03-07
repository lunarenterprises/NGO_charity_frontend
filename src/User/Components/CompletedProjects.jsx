import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompletedProjectsApi } from '../../Services/userApi';

const CompletedProjects = () => {
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const res = await getCompletedProjectsApi({ page: 1, limit: 3 });
                if (res?.data?.projects || res?.data?.data) {
                    setProjects(res.data.projects || res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch completed projects:", err);
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
        return "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <span className="bg-gray-100 border text-black px-4 py-1.5 rounded-full text-sm font-medium">
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
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-gray-100 h-96 rounded-2xl border border-gray-100"></div>
                        ))
                    ) : projects.length > 0 ? (
                        projects.map((project, index) => (
                            <div key={project._id || project.id || index} className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex flex-col hover:border-gray-300 transition-colors">
                                {/* Image Section */}
                                <div
                                    className="relative h-48 overflow-hidden bg-gray-200 cursor-pointer group"
                                    onClick={() => navigate(`/project/${project._id || project.id}`)}
                                >
                                    <img
                                        src={firstImage(project)}
                                        alt={project.name || project.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        {project.category || "Initiative"}
                                    </div>
                                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1 rounded-md">
                                        Completed {formatDate(project.updatedAt || project.createdAt)}
                                    </div>

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
                                    <h3 className="text-lg font-bold text-black mb-2 line-clamp-2">
                                        {project.name || project.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6 grow line-clamp-3">
                                        {project.summary || project.description}
                                    </p>

                                    <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-black">
                                                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-bold text-black ">₹{parseFloat(project.targetAmount || 0).toLocaleString('en-IN')} Target</span>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/project/${project._id || project.id}`)}
                                            className="text-sm text-black font-medium hover:underline shrink-0 pl-2"
                                        >
                                            Read Story
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            No recent success stories found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompletedProjects;
