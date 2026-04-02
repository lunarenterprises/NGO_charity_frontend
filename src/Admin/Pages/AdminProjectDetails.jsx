import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
    HiOutlineArrowLeft,
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiOutlinePlay,
    HiX,
    HiOutlineCloudUpload,
    HiOutlinePlus,
    HiOutlineChevronLeft,
    HiOutlineChevronRight
} from 'react-icons/hi';
import { getProjectByIdApi, deleteProjectApi, markProjectCompleteApi, updateProjectApi, getProjectDonationsApi } from '../../Services/adminApi';
import { showToast, showConfirm } from '../../Utils/alert';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80';

// ── Loading skeleton ─────────────────────────────────────────────────
const Skeleton = ({ className }) => (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

const AdminProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeMedia, setActiveMedia] = useState(null);

    // ── Donations State ──────────────────────────────────────────────
    const [donors, setDonors] = useState([]);
    const [loadingDonors, setLoadingDonors] = useState(true);
    const [donorPage, setDonorPage] = useState(1);
    const [donorTotalPages, setDonorTotalPages] = useState(1);
    const [donorTotalRecords, setDonorTotalRecords] = useState(0);

    // ── Edit Modal State ─────────────────────────────────────────────
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', summary: '', description: '', targetAmount: '', images: [], video: null, existingImages: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);

    // ── Fetch project detail ──────────────────────────────────────────
    const fetchProject = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await getProjectByIdApi(id);
            const data = response?.data?.project || response?.data?.data || response?.data;
            if (data) {
                setProject(data);
                // default to first image; fall back to video if no images
                const imgs = Array.isArray(data.projectImages)
                    ? data.projectImages
                    : (() => { try { const p = JSON.parse(data.projectImages); return Array.isArray(p) ? p : []; } catch { return []; } })();
                if (imgs.length > 0) {
                    setActiveMedia({ type: 'image', src: imgs[0] });
                } else if (data.projectVideo) {
                    setActiveMedia({ type: 'video', src: data.projectVideo });
                }
            } else {
                showToast('Project not found', 'error');
            }
        } catch (err) {
            console.error('Fetch project detail error:', err);
            showToast('Failed to load project details', 'error');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    // ── Fetch project donations ──────────────────────────────────────
    const fetchProjectDonations = React.useCallback(async () => {
        setLoadingDonors(true);
        try {
            const result = await getProjectDonationsApi(id, { page: donorPage, limit: 10 });
            if (result.status === 200 && result.data) {
                const responseData = result.data;
                if (responseData.success || responseData.result) {
                    const data = responseData.data || [];
                    setDonors(data);

                    if (responseData.meta) {
                        setDonorTotalPages(responseData.meta.totalPages || 1);
                        setDonorTotalRecords(responseData.meta.total || data.length);
                    } else if (responseData.pagination) {
                        setDonorTotalPages(responseData.pagination.totalPages || 1);
                        setDonorTotalRecords(responseData.pagination.total || data.length);
                    } else {
                        setDonorTotalPages(data.length < 10 ? donorPage : donorPage + 1);
                        setDonorTotalRecords(data.length);
                    }
                } else {
                    setDonors([]);
                }
            } else {
                const status = result.response?.status || result.status;
                if (status === 401) {
                    setTimeout(() => fetchProjectDonations(), 1000);
                }
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setTimeout(() => fetchProjectDonations(), 1000);
            }
            console.error('Fetch project donations error:', err);
        } finally {
            setLoadingDonors(false);
        }
    }, [id, donorPage]);

    useEffect(() => {
        fetchProjectDonations();
    }, [fetchProjectDonations]);

    // ── Auto-open edit modal from ?edit=true URL param ───────────────
    useEffect(() => {
        if (project && searchParams.get('edit') === 'true') {
            openEditModal();
            setSearchParams({}, { replace: true }); // Clean up URL
        }
    }, [project, searchParams]);

    // ── Scroll to anchor ─────────────────────────────────────────────
    useEffect(() => {
        if (location.hash === '#recent-contributions') {
            const el = document.getElementById('recent-contributions');
            if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [location]);

    // ── Helpers ───────────────────────────────────────────────────────
    // API may return projectImages as a JSON string OR a real array
    const parseImages = (raw) => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; }
        catch { return []; }
    };

    const formatAmount = (val) => {
        const num = parseFloat(val) || 0;
        return `Rs. ${num.toLocaleString('en-IN')}`;
    };

    const progressPercent = () => {
        const target = parseFloat(project?.targetAmount) || 0;
        const current = parseFloat(project?.currentAmount) || 0;
        if (target === 0) return 0;
        return Math.min(Math.round((current / target) * 100), 100);
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

    const isVideoActive = activeMedia?.type === 'video';

    // ── Download Revenue Report as PDF ───────────────────────────────
    const handleDownloadReport = async () => {
        try {
            showToast('Generating PDF report...', 'info');

            // Fetch ALL donation pages
            let allDonors = [];
            let pg = 1;
            let totalPgs = 1;
            do {
                const res = await getProjectDonationsApi(id, { page: pg, limit: 100 });
                const d = res?.data?.data || [];
                allDonors = [...allDonors, ...d];
                totalPgs = res?.data?.meta?.totalPages || res?.data?.pagination?.totalPages || 1;
                pg++;
            } while (pg <= totalPgs);

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // Header bar
            doc.setFillColor(0, 0, 0);
            doc.rect(0, 0, pageWidth, 28, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Revenue Report', 14, 12);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Project: ${project?.name || 'N/A'}`, 14, 20);
            doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageWidth - 14, 20, { align: 'right' });

            // Summary stats
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');

            const raised = parseFloat(project?.currentAmount) || 0;
            const target = parseFloat(project?.targetAmount) || 0;
            const progress = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;
            const grandTotal = allDonors.reduce((acc, d) => acc + Number(d.amount || 0), 0);

            const stats = [
                ['Total Donors', allDonors.length],
                ['Total Raised', `Rs. ${raised.toLocaleString('en-IN')}`],
                ['Target Amount', `Rs. ${target.toLocaleString('en-IN')}`],
                ['Progress', `${progress}%`],
            ];

            autoTable(doc, {
                startY: 34,
                body: stats,
                theme: 'plain',
                styles: { fontSize: 10, cellPadding: 3 },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 }, 1: { cellWidth: 60 } },
                margin: { left: 14 },
            });

            // Donor table
            const tableY = doc.lastAutoTable.finalY + 10;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Donation Details', 14, tableY);

            const rows = allDonors.map((donor, i) => [
                i + 1,
                donor.donorName || donor.name || donor.User?.fullname || 'Anonymous',
                donor.donorPhone || donor.phone || donor.user?.phone || donor.User?.phone || 'N/A',
                `Rs. ${Number(donor.amount || 0).toLocaleString('en-IN')}`,
            ]);

            autoTable(doc, {
                startY: tableY + 5,
                head: [['#', 'Name', 'Phone', 'Amount']],
                body: rows,
                theme: 'striped',
                headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold', fontSize: 10 },
                bodyStyles: { fontSize: 9 },
                columnStyles: {
                    0: { cellWidth: 12 },
                    1: { cellWidth: 85 },
                    2: { cellWidth: 50 },
                    3: { cellWidth: 35, halign: 'right' },
                },
                margin: { left: 14, right: 14 }
            });

            // Grand Total footer
            const finalY = doc.lastAutoTable.finalY + 8;
            doc.setFillColor(0, 0, 0);
            doc.rect(14, finalY, pageWidth - 28, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('GRAND TOTAL', 18, finalY + 6.5);
            doc.text(`Rs. ${grandTotal.toLocaleString('en-IN')}`, pageWidth - 18, finalY + 6.5, { align: 'right' });

            doc.save(`${project?.name?.replace(/\s+/g, '_') || 'project'}_revenue_report.pdf`);
        } catch (err) {
            console.error('PDF generation error:', err);
            showToast('Failed to generate report. Please try again.', 'error');
        }
    };

    // ── Delete handler ───────────────────────────────────────────
    const handleDelete = async () => {
        const confirmed = await showConfirm(
            'Delete Project?',
            'This action is permanent and cannot be undone. All associated data will be removed.'
        );
        if (!confirmed.isConfirmed) return;
        try {
            const response = await deleteProjectApi(id);
            const isSuccess = response?.data?.result || (response?.status >= 200 && response?.status < 300);
            if (isSuccess) {
                showToast(response?.data?.message || 'Project deleted successfully', 'success');
                navigate('/admin/active-projects');
            } else {
                showToast(response?.data?.message || response?.response?.data?.message || 'Failed to delete project', 'error');
            }
        } catch (err) {
            console.error('Delete project error:', err);
            showToast('Something went wrong. Please try again.', 'error');
        }
    };

    // ── Mark as completed handler ────────────────────────────────
    const handleMarkComplete = async () => {
        const confirmed = await showConfirm(
            'Mark Project as Completed?',
            'Are you sure you want to mark this project as completed?'
        );
        if (!confirmed.isConfirmed) return;
        try {
            const response = await markProjectCompleteApi(id);
            const isSuccess = response?.data?.result ? true : (response?.status >= 200 && response?.status < 300);
            if (isSuccess) {
                showToast(response?.data?.message || 'Project marked as completed', 'success');
                setProject(prev => ({ ...prev, status: 'Completed' }));
            } else {
                showToast(response?.data?.message || response?.response?.data?.message || 'Failed to mark as completed', 'error');
            }
        } catch (err) {
            console.error('Mark complete error:', err);
            showToast('Something went wrong. Please try again.', 'error');
        }
    };

    // ── Edit Project Handlers ─────────────────────────────────────────
    const openEditModal = () => {
        let existingImages = [];
        try {
            existingImages = Array.isArray(project.projectImages) ? project.projectImages : JSON.parse(project.projectImages);
            if (!Array.isArray(existingImages)) existingImages = [];
        } catch { existingImages = []; }

        setFormData({
            name: project.name || '',
            summary: project.summary || '',
            description: project.description || '',
            targetAmount: project.targetAmount || '',
            images: [],
            video: null,
            existingImages: existingImages
        });

        // Setup initial previews from existing URLs
        setImagePreviews(existingImages.map(url => ({ id: Math.random().toString(36).substr(2, 9), url, isExisting: true })));
        setIsEditModalOpen(true);
    };

    const handleFormChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            if (name === 'images') {
                const newFiles = Array.from(files);
                const remaining = 4 - (formData.images.length + formData.existingImages.length);
                if (remaining <= 0) return;
                const sliced = newFiles.slice(0, remaining);
                const newPreviews = sliced.map(file => ({
                    id: Math.random().toString(36).substr(2, 9), file, url: URL.createObjectURL(file), isExisting: false
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
        const removedPreview = imagePreviews.find(img => img.id === id);
        if (!removedPreview) return;

        if (removedPreview.isExisting) {
            setFormData(prev => ({ ...prev, existingImages: prev.existingImages.filter(url => url !== removedPreview.url) }));
        } else {
            URL.revokeObjectURL(removedPreview.url);
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter((_, idx) => {
                    const preview = imagePreviews.filter(p => !p.isExisting)[idx];
                    return preview && preview.id !== id;
                })
            }));
        }

        setImagePreviews(prev => prev.filter(img => img.id !== id));
    };

    const resetForm = () => {
        imagePreviews.forEach(p => { if (!p.isExisting) URL.revokeObjectURL(p.url) });
        setFormData({ name: '', summary: '', description: '', targetAmount: '', images: [], video: null, existingImages: [] });
        setImagePreviews([]);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('summary', formData.summary);
            data.append('description', formData.description);
            data.append('targetAmount', formData.targetAmount);

            // Append existing image urls to keep. Since the backend might expect strings for existing, we will append correctly.
            data.append('existingImages', JSON.stringify(formData.existingImages));

            // Append new files
            formData.images.forEach(img => data.append('projectImages', img));
            if (formData.video) data.append('projectVideo', formData.video);

            const response = await updateProjectApi(id, data);
            const isSuccess = response?.data?.result || (response?.status >= 200 && response?.status < 300);
            if (isSuccess) {
                showToast(response?.data?.message || 'Project updated successfully!', 'success');
                setIsEditModalOpen(false);
                resetForm();
                fetchProject(); // Refresh details
            } else {
                showToast(response?.data?.message || response?.response?.data?.message || 'Failed to update project', 'error');
            }
        } catch (error) {
            console.error('Update project error:', error);
            showToast('Something went wrong. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Donors Data Managed via API ───────────────────────────────────

    // ── Render ────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Top Nav */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-8">
                <div className="flex items-center gap-4">
                    <Link to={location.pathname.includes('completed-projects') ? "/admin/completed-projects" : "/admin/active-projects"}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black">
                        <HiOutlineArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        {loading
                            ? <Skeleton className="h-7 w-64 mb-2" />
                            : <h1 className="text-2xl font-bold text-black tracking-tight">{project?.name}</h1>
                        }
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                            Project ID: <span className="text-black">#{id}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            Status: <span className="text-teal-600">{project?.status || 'Active'}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={openEditModal} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 text-black text-[10px] font-black uppercase tracking-widest rounded hover:border-black hover:bg-gray-50 transition-all shadow-sm">
                        <HiOutlinePencilAlt className="w-4 h-4" />
                        Edit Project
                    </button>
                    <button onClick={handleDelete} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-red-700 transition-all shadow-sm">
                        <HiOutlineTrash className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Media Gallery */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                {/* Main Viewport */}
                <div className="lg:col-span-9 relative aspect-video rounded-xl overflow-hidden bg-black border border-gray-200">
                    {loading ? (
                        <Skeleton className="w-full h-full rounded-none" />
                    ) : isVideoActive && activeMedia?.src ? (
                        <video
                            src={activeMedia.src}
                            controls
                            className="w-full h-full object-contain bg-black"
                        />
                    ) : activeMedia?.src ? (
                        <div className="relative w-full h-full animate-in zoom-in-95 duration-300">
                            <img
                                src={activeMedia.src}
                                alt="Selected Project Media"
                                className="w-full h-full object-cover"
                                onError={e => { e.target.src = FALLBACK_IMAGE; }}
                            />
                            {project?.projectVideo && (
                                <button
                                    onClick={() => setActiveMedia({ type: 'video', src: project.projectVideo })}
                                    className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg"
                                >
                                    <HiOutlinePlay className="w-4 h-4" />
                                    Watch Video
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                            No media available
                        </div>
                    )}
                </div>

                {/* Sidebar Thumbnails */}
                <div className="lg:col-span-3 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[min(50vw,500px)] custom-scrollbar pb-2 lg:pb-0">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="flex-shrink-0 aspect-video w-32 lg:w-full rounded-xl" />
                        ))
                    ) : (
                        <>
                            {/* Video thumbnail */}
                            {project?.projectVideo && (
                                <div
                                    onClick={() => setActiveMedia({ type: 'video', src: project.projectVideo })}
                                    className={`flex-shrink-0 relative aspect-video w-32 lg:w-full rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${isVideoActive ? 'border-black ring-4 ring-black/5' : 'border-transparent hover:border-gray-300'}`}
                                >
                                    <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white p-4">
                                        <HiOutlinePlay className="w-8 h-8 opacity-60 group-hover:scale-110 transition-transform" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] mt-2 block">Watch Video</span>
                                    </div>
                                </div>
                            )}

                            {/* Image thumbnails */}
                            {parseImages(project?.projectImages).map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setActiveMedia({ type: 'image', src: img })}
                                    className={`flex-shrink-0 relative aspect-video w-32 lg:w-full rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${activeMedia?.type === 'image' && activeMedia?.src === img ? 'border-black ring-4 ring-black/5' : 'border-transparent hover:border-gray-300'}`}
                                >
                                    <img
                                        src={img}
                                        alt={`Gallery ${idx + 1}`}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                        onError={e => { e.target.src = FALLBACK_IMAGE; }}
                                    />
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* Info + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Description */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white border border-gray-100 rounded-xl space-y-6 p-6">
                        {loading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-4 w-48 mt-4" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Project Concept</h2>
                                    <p className="text-lg font-bold text-black leading-relaxed italic border-l-4 border-black pl-6">
                                        "{project?.summary}"
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Detailed Impact Strategy</h2>
                                    <div className="text-sm text-gray-600 leading-loose whitespace-pre-wrap font-medium">
                                        {project?.description}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Funding Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-black text-white p-8 rounded-xl shadow-xl space-y-6">
                        {loading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-36 bg-white/20" />
                                <Skeleton className="h-4 w-full bg-white/20" />
                                <Skeleton className="h-3 w-3/4 bg-white/20" />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Raised</p>
                                            <h3 className="text-3xl font-black">{formatAmount(project?.currentAmount)}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Target</p>
                                            <p className="text-lg font-bold text-gray-300">{formatAmount(project?.targetAmount)}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-white transition-all duration-1000 ease-out"
                                                style={{ width: `${progressPercent()}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span>{progressPercent()}% Complete</span>
                                            <span className="text-gray-400">Updated {timeAgo(project?.updatedAt || project?.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button onClick={handleDownloadReport} className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded hover:bg-gray-100 transition-all shadow-lg">
                                        Download Revenue Report
                                    </button>
                                    {project?.status?.toLowerCase() !== 'completed' && (
                                        <button onClick={handleMarkComplete} className="w-full py-4 bg-teal-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded hover:bg-teal-700 transition-all shadow-lg">
                                            Mark as Completed
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Donor Table */}
            <div id="recent-contributions" className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 bg-black flex justify-between items-center">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Recent Contributions</h2>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{donorTotalRecords || donors.length} Donors</span>
                </div>

                {loadingDonors ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-black uppercase tracking-widest">Loading Contributions...</p>
                    </div>
                ) : donors.length === 0 ? (
                    <div className="p-20 text-center bg-gray-50/30 border-t border-gray-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">No recorded project contributions yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Donor Name</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Email</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Phone</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black text-center">Date</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donors.map((donor) => {
                                        const donorName = donor.donorName || donor.name || donor.User?.fullname || donor.user?.fullname || 'Anonymous';
                                        const donorEmail = donor.donorEmail || donor.email || donor.User?.email || donor.user?.email || 'N/A';
                                        const donorPhone = donor.donorPhone || donor.phone || donor.User?.phone || donor.user?.phone || 'N/A';
                                        const date = donor.createdAt ? new Date(donor.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
                                        const amount = Number(donor.amount || 0).toLocaleString('en-IN');

                                        return (
                                            <tr key={donor._id || donor.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <p className="text-sm font-bold text-black group-hover:underline underline-offset-4 decoration-gray-300">{donorName}</p>
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                                                            ID: {(donor.razorpayPaymentId || donor.paymentId || donor._id || donor.id)?.toString().substring(0, 15)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500 font-medium">{donorEmail}</td>
                                                <td className="px-6 py-4 text-xs text-gray-500 font-medium">{donorPhone}</td>
                                                <td className="px-6 py-4 text-xs text-gray-500 font-medium text-center">{date}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-black text-black bg-gray-100 px-3 py-1 rounded-md">₹{amount}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Controls */}
                        {donorTotalPages > 1 && (
                            <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    Page <span className="text-black">{donorPage}</span> of <span className="text-black">{donorTotalPages}</span>
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setDonorPage(prev => Math.max(prev - 1, 1))}
                                        disabled={donorPage === 1}
                                        className="p-2 border border-gray-200 rounded-lg hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                    >
                                        <HiOutlineChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setDonorPage(prev => Math.min(prev + 1, donorTotalPages))}
                                        disabled={donorPage === donorTotalPages}
                                        className="p-2 border border-gray-200 rounded-lg hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                    >
                                        <HiOutlineChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── EDIT PROJECT MODAL ── */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsEditModalOpen(false); resetForm(); }} />
                    <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-black uppercase tracking-tight">Edit Project</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update the necessary details below</p>
                            </div>
                            <button onClick={() => { setIsEditModalOpen(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <HiX className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
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
                                <div className="space-y-1.5 relative group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block px-1">Target Amount (₹)</label>
                                    <input required name="targetAmount" value={formData.targetAmount} onChange={handleFormChange}
                                        type="number" min="1" placeholder="e.g. 500000"
                                        disabled
                                        className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none cursor-not-allowed opacity-70 transition-all font-bold text-gray-600" />
                                    <div className="absolute right-3 top-[34px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <span className="bg-black text-white text-[8px] font-bold px-2 py-1 rounded uppercase tracking-tighter">Read Only</span>
                                    </div>
                                </div>

                                {/* Media Uploads */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {/* Images */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block px-1">Project Images (Max 4)</label>
                                            <div className={`relative group ${formData.images.length + formData.existingImages.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <input type="file" name="images" accept="image/*" multiple
                                                    disabled={formData.images.length + formData.existingImages.length >= 4} onChange={handleFormChange}
                                                    className={`absolute inset-0 w-full h-full opacity-0 ${formData.images.length + formData.existingImages.length >= 4 ? 'cursor-not-allowed' : 'cursor-pointer'} z-10`} />
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
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                                                        {formData.video ? formData.video.name : (project?.projectVideo ? 'Replace Video' : 'Choose Video')}
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
                                <button type="button" onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                                    className="grow py-4 border border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-gray-50 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting}
                                    className={`grow py-4 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all shadow-lg ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}>
                                    {isSubmitting ? 'Updating...' : 'Update Initiative'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProjectDetails;
