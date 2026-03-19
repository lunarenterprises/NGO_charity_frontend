import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlinePlus, HiX, HiOutlineCloudUpload, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { createProjectApi, getActiveProjectsApi, deleteProjectApi } from '../../Services/adminApi';
import { showToast, showAlert, showConfirm } from '../../Utils/alert';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80';

const ActiveProjects = () => {
    const navigate = useNavigate();

    // ── Modal / form state ────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', summary: '', description: '', targetAmount: '', images: [], video: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);

    // ── Projects list state ───────────────────────────────────────────
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: 10 });

    // ── Fetch projects ────────────────────────────────────────────────
    const fetchProjects = useCallback(async (pageNum = 1) => {
        setLoading(true);
        try {
            const response = await getActiveProjectsApi({ page: pageNum, limit: 10 });
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

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => { imagePreviews.forEach(p => URL.revokeObjectURL(p.url)); };
    }, [imagePreviews]);

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

    // ── Form handlers ─────────────────────────────────────────────────
    const handleFormChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            if (name === 'images') {
                const newFiles = Array.from(files);
                const remaining = 4 - formData.images.length;
                if (remaining <= 0) return;
                const sliced = newFiles.slice(0, remaining);
                const newPreviews = sliced.map(file => ({
                    id: Math.random().toString(36).substr(2, 9), file, url: URL.createObjectURL(file)
                }));
                setImagePreviews(prev => [...prev, ...newPreviews]);
                setFormData(prev => ({ ...prev, images: [...prev.images, ...sliced] }));
            } else {
                setFormData(prev => ({ ...prev, [name]: files[0] }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const removeImage = (id) => {
        setImagePreviews(prev => {
            const removed = prev.find(img => img.id === id);
            if (removed) URL.revokeObjectURL(removed.url);
            return prev.filter(img => img.id !== id);
        });
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, idx) => {
                const preview = imagePreviews[idx];
                return preview && preview.id !== id;
            })
        }));
    };

    const resetForm = () => {
        imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
        setFormData({ name: '', summary: '', description: '', targetAmount: '', images: [], video: null });
        setImagePreviews([]);
    };

    const handleDeleteCard = async (projectId, projectName) => {
        const confirmed = await showConfirm(
            `Delete "${projectName}"?`,
            'This action is permanent and cannot be undone.'
        );
        if (!confirmed.isConfirmed) return;
        try {
            const response = await deleteProjectApi(projectId);
            const isSuccess = response?.data?.result || (response?.status >= 200 && response?.status < 300);
            if (isSuccess) {
                showToast(response?.data?.message || 'Project deleted', 'success');
                fetchProjects(page);
            } else {
                showToast(response?.data?.message || 'Failed to delete project', 'error');
            }
        } catch (err) {
            console.error('Delete error:', err);
            showToast('Something went wrong. Please try again.', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('summary', formData.summary);
            data.append('description', formData.description);
            data.append('targetAmount', formData.targetAmount);
            formData.images.forEach(img => data.append('projectImages', img));
            if (formData.video) data.append('projectVideo', formData.video);

            const response = await createProjectApi(data);
            const isSuccess = response?.data?.result || (response?.status >= 200 && response?.status < 300);
            if (isSuccess) {
                showAlert(response?.data?.message || 'Project created successfully!', '', 'success');
                setIsModalOpen(false);
                resetForm();
                fetchProjects(1);   // refresh list
                setPage(1);
            } else {
                showToast(response?.data?.message || response?.response?.data?.message || 'Failed to create project', 'error');
            }
        } catch (error) {
            console.error('Create project error:', error);
            showToast('Something went wrong. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
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
                <div className="grow h-10 bg-gray-100 rounded" />
            </div>
        </div>
    );

    // ── Render ────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-2xl font-bold text-black tracking-tight">Active Projects</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Monitor and manage ongoing Yashfi Foundation initiatives.
                        {!loading && meta.total > 0 && (
                            <span className="ml-2 text-xs font-black uppercase tracking-widest text-gray-400">
                                ({meta.total} total)
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold rounded uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    New Project
                </button>
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
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/active-projects/${project.id || project._id}?edit=true`); }}
                                            className="p-2.5 bg-white text-black rounded shadow-md hover:bg-gray-100 transition-colors">
                                            <HiOutlinePencilAlt className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteCard(project.id || project._id, project.name); }}
                                            className="p-2.5 bg-red-600 text-white rounded shadow-md hover:bg-red-700 transition-colors">
                                            <HiOutlineTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <span className="absolute top-4 left-4 px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm border border-gray-200 text-teal-700 text-[9px] font-black uppercase tracking-tighter shadow-sm">
                                        {project.status || 'Active'}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="p-6 space-y-4 grow">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            {project.category || 'Initiative'}
                                        </span>
                                        <h3 className="text-lg font-bold text-black leading-tight group-hover:underline transition-all underline-offset-4">
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
                                                className="h-full bg-black transition-all duration-700 ease-out shadow-sm"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            <span className="text-black font-bold">{progress}% Complete</span>
                                            <span className="italic">Updated {timeAgo(project.updatedAt || project.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="px-6 pb-6 mt-auto flex gap-3">
                                    <button
                                        onClick={() => navigate(`/admin/active-projects/${project.id || project._id}`)}
                                        className="grow py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all rounded shadow-sm"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/active-projects/${project.id || project._id}#recent-contributions`)}
                                        className="grow py-2.5 bg-white border border-black text-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded shadow-sm"
                                    >
                                        Analytics
                                    </button>
                                </div>
                            </div>
                        );
                    })
                }

                {/* Add New placeholder — only show when not loading */}
                {!loading && (
                    <div
                        onClick={() => setIsModalOpen(true)}
                        className="border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-black transition-all bg-gray-50/20 h-full min-h-[400px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                            <HiOutlinePlus className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-black">Add New Initiative</span>
                    </div>
                )}
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
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">No active projects found.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4 px-6 py-3 bg-black text-white text-xs font-bold rounded uppercase tracking-widest hover:bg-gray-800 transition-colors"
                    >
                        Create First Project
                    </button>
                </div>
            )}

            {/* ── NEW PROJECT MODAL ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsModalOpen(false); resetForm(); }} />
                    <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-black uppercase tracking-tight">Initiate New Project</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enter comprehensive details below</p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <HiX className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                {/* Project Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block px-1">Project Name</label>
                                    <input required name="name" value={formData.name} onChange={handleFormChange} type="text"
                                        placeholder="e.g. Rural Education Empowerment"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-all" />
                                </div>

                                {/* Summary */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block px-1">Concept Summary</label>
                                    <textarea required name="summary" value={formData.summary} onChange={handleFormChange} rows="2"
                                        placeholder="Brief 1-2 sentence overview of the initiative..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-all resize-none" />
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block px-1">Full Description</label>
                                    <textarea required name="description" value={formData.description} onChange={handleFormChange} rows="4"
                                        placeholder="Detailed project requirements, goals, and impact plan..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-all resize-none" />
                                </div>

                                {/* Target Amount */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block px-1">Target Amount (₹)</label>
                                    <input required name="targetAmount" value={formData.targetAmount} onChange={handleFormChange}
                                        type="number" min="1" placeholder="e.g. 500000"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-all" />
                                </div>

                                {/* Media Uploads */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {/* Images */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block px-1">Project Images (Max 4)</label>
                                            <div className={`relative group ${formData.images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <input type="file" name="images" accept="image/*" multiple
                                                    disabled={formData.images.length >= 4} onChange={handleFormChange}
                                                    className={`absolute inset-0 w-full h-full opacity-0 ${formData.images.length >= 4 ? 'cursor-not-allowed' : 'cursor-pointer'} z-10`} />
                                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 group-hover:border-black transition-all bg-gray-50">
                                                    <HiOutlineCloudUpload className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors" />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Add Images</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Video */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block px-1">Intro Video</label>
                                            <div className="relative group">
                                                <input type="file" name="video" accept="video/*" onChange={handleFormChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 group-hover:border-black transition-all bg-gray-50">
                                                    <HiOutlineCloudUpload className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors" />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        {formData.video ? formData.video.name : 'Choose Video'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Previews */}
                                    {imagePreviews.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Selected Images ({imagePreviews.length})</p>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                                {imagePreviews.map((preview) => (
                                                    <div key={preview.id} className="relative aspect-square group">
                                                        <img src={preview.url} alt="preview" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                                        <button type="button" onClick={() => removeImage(preview.id)}
                                                            className="absolute -top-1.5 -right-1.5 bg-black text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                            <HiX className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {imagePreviews.length < 4 && (
                                                    <div className="relative aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center group cursor-pointer hover:border-black transition-all">
                                                        <input type="file" name="images" accept="image/*" multiple onChange={handleFormChange}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                        <HiOutlinePlus className="w-5 h-5 text-gray-300 group-hover:text-black" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex gap-4">
                                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    className="grow py-4 border border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-gray-50 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting}
                                    className={`grow py-4 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all shadow-lg ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}>
                                    {isSubmitting ? 'Publishing...' : 'Publish Initiative'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveProjects;
