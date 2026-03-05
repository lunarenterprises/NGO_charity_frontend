import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompletedProjectsApi } from '../../Services/userApi';

const CompletedProjectsListing = () => {
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ totalPages: 1, total: 0 });

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const res = await getCompletedProjectsApi({ page, limit: 10 });
                if (res?.data?.projects || res?.data?.data) {
                    setProjects(res.data.projects || res.data.data);
                    if (res.data.meta) setMeta(res.data.meta);
                }
            } catch (err) {
                console.error("Failed to fetch completed projects:", err);
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
        return "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-gray-200 h-96 rounded-2xl"></div>
                        ))
                    ) : projects.length > 0 ? (
                        projects.map((project, index) => (
                            <div key={project._id || project.id || index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col">
                                {/* Image Section */}
                                <div
                                    className="relative h-56 overflow-hidden bg-gray-100 cursor-pointer group"
                                    onClick={() => navigate(`/project/${project._id || project.id}`)}
                                >
                                    <img
                                        src={firstImage(project)}
                                        alt={project.name || project.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                                        {project.category || "Initiative"}
                                    </div>
                                    <div className="absolute inset-0 bg-black/20"></div>
                                    {/* Eye Icon Overlay Hint */}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-black">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <span className="text-xs font-medium opacity-80">Completed {formatDate(project.updatedAt || project.createdAt)}</span>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-6 flex flex-col grow">
                                    <h3 className="text-xl font-bold text-black mb-2 line-clamp-2">
                                        {project.name || project.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6 grow line-clamp-3">
                                        {project.summary || project.description}
                                    </p>

                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-black">
                                                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Amount Raised</div>
                                                <div className="text-sm font-bold text-black">₹{parseFloat(project.currentAmount || 0).toLocaleString('en-IN')}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/project/${project._id || project.id}`)}
                                            className="w-full mt-6 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                                        >
                                            View Full Story
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No completed projects found.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && meta.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 border border-gray-200 rounded-lg bg-black text-white text-sm font-medium">
                            {page} / {meta.totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                            disabled={page === meta.totalPages}
                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompletedProjectsListing;
