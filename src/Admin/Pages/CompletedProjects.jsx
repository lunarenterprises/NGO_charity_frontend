import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineEye, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { getCompletedProjectsApi } from '../../Services/userApi'; // Using the generic API
import { showToast } from '../../Utils/alert';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80';

const CompletedProjects = () => {
    const navigate = useNavigate();

    // ── Projects list state ───────────────────────────────────────────
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: 10 });

    // ── Fetch projects ────────────────────────────────────────────────
    const fetchProjects = useCallback(async (pageNum = 1) => {
        setLoading(true);
        try {
            const response = await getCompletedProjectsApi({ page: pageNum, limit: 10 });
            const data = response?.data;
            if (data) {
                setProjects(data.projects || data.data || []);
                if (data.meta) setMeta(data.meta);
            }
        } catch (err) {
            console.error('Fetch projects error:', err);
            showToast('Failed to load projects', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProjects(page); }, [fetchProjects, page]);

    // ── Helpers ───────────────────────────────────────────────────────
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

    const firstImage = (project) => {
        let imgs = project.projectImages;
        if (!Array.isArray(imgs)) {
            try { imgs = JSON.parse(imgs); } catch { imgs = []; }
        }
        if (Array.isArray(imgs) && imgs.length > 0) return imgs[0];
        return FALLBACK_IMAGE;
    };

    const timeAgo = (dateStr) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    // ── Loading skeleton ──────────────────────────────────────────────
    const SkeletonCard = () => (
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm flex flex-col overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-6 space-y-4">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="space-y-2 pt-2">
                    <div className="h-2 w-full bg-gray-100 rounded-full" />
                    <div className="h-2 w-1/2 bg-gray-100 rounded" />
                </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
                <div className="grow h-10 bg-gray-200 rounded" />
            </div>
        </div>
    );

    // ── Render ────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-2xl font-bold text-black tracking-tight">Completed Projects</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Archive of successfully funded and completed Yashfi Foundation initiatives.
                        {!loading && meta.total > 0 && (
                            <span className="ml-2 text-xs font-black uppercase tracking-widest text-gray-400">
                                ({meta.total} total)
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                    : projects.map((project) => {
                        const progress = progressPercent(project);
                        return (
                            <div key={project.id || project._id} className="bg-white border border-gray-100 rounded-lg shadow-sm hover:border-black transition-all group flex flex-col h-full overflow-hidden">
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden bg-gray-100">
                                    <img
                                        src={firstImage(project)}
                                        alt={project.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={e => { e.target.src = FALLBACK_IMAGE; }}
                                    />
                                    <span className="absolute top-4 left-4 px-2 py-0.5 rounded bg-teal-600 border border-teal-700 text-white text-[9px] font-black uppercase tracking-tighter shadow-sm">
                                        Completed
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="p-6 space-y-4 grow">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            {project.category || 'Initiative'}
                                        </span>
                                        <h3 className="text-lg font-bold text-black leading-tight group-hover:underline transition-all underline-offset-4 line-clamp-2">
                                            {project.name}
                                        </h3>
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Raised</span>
                                                <span className="text-sm font-black text-black">{formatAmount(project.currentAmount)}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target</span>
                                                <span className="text-sm font-bold text-gray-500">{formatAmount(project.targetAmount)}</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-teal-500 shadow-sm"
                                                style={{ width: `100%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            <span className="text-teal-600 font-bold">{progress}% Funded</span>
                                            <span className="italic">Completed {timeAgo(project.updatedAt || project.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="px-6 pb-6 mt-auto flex gap-3">
                                    <button
                                        onClick={() => navigate(`/admin/completed-projects/${project.id || project._id}`)}
                                        className="grow py-2.5 bg-gray-100 text-black text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all rounded shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <HiOutlineEye className="w-4 h-4" />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        );
                    })
                }
            </div>

            {/* Pagination */}
            {!loading && meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 border border-gray-200 rounded hover:border-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <HiChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                        Page {page} of {meta.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                        disabled={page === meta.totalPages}
                        className="p-2 border border-gray-200 rounded hover:border-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <HiChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!loading && projects.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">No completed projects found.</p>
                </div>
            )}
        </div>
    );
};

export default CompletedProjects;
