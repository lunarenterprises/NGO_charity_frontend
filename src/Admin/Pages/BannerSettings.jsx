import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePhotograph, HiChevronLeft, HiChevronRight, HiX, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { showToast, showConfirm } from '../../Utils/alert';
import {
    addBannerApi,
    getAllBannersApi,
    toggleBannerStatusApi,
    deleteBannerApi
} from '../../Services/adminApi';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80';

const BannerSettings = () => {
    // ── States ────────────────────────────────────────────────────────
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: 10 });

    // Modal & Upload States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // Pagination for Main Preview View (cycles through ACTIVE banners only for accurate public preview)
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

    // ── Fetch Banners ─────────────────────────────────────────────────
    const fetchBanners = useCallback(async (pageNum = 1) => {
        setLoading(true);
        try {
            const response = await getAllBannersApi({ page: pageNum, limit: 20 });
            const data = response?.data;
            if (data?.banners || data?.data) {
                const fetchedBanners = data.banners || data.data || [];
                setBanners(fetchedBanners);
                if (data.meta) setMeta(data.meta);

                // Reset preview index if out of bounds for the newly fetched active banners
                const activeCount = fetchedBanners.filter(b => b.isActive).length;
                if (currentPreviewIndex >= activeCount && activeCount > 0) {
                    setCurrentPreviewIndex(0);
                } else if (activeCount === 0) {
                    setCurrentPreviewIndex(0);
                }
            }
        } catch (err) {
            console.error('Fetch banners error:', err);
            showToast('Failed to load banners', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentPreviewIndex]);

    useEffect(() => {
        fetchBanners(page);
    }, [fetchBanners, page]);

    // Clean up object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // Derived state: strictly active banners for the hero preview
    const activeBanners = banners.filter(b => b.isActive);

    // ── Handlers ──────────────────────────────────────────────────────
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        // Setup local preview
        const fileUrl = URL.createObjectURL(file);
        setPreviewUrl(fileUrl);
    };

    const handleUploadSubmit = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('bannerImage', selectedFile);

            const response = await addBannerApi(formData);
            const isSuccess = response?.data?.result !== false && (response?.status >= 200 && response?.status < 300);

            if (isSuccess) {
                showToast(response?.data?.message || 'Banner added successfully', 'success');
                fetchBanners(1); // Refresh list
                closeUploadModal();
            } else {
                showToast(response?.data?.message || response?.response?.data?.message || 'Failed to upload banner', 'error');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            showToast('Something went wrong during upload.', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const closeUploadModal = () => {
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    const handleDeleteBanner = async (id) => {
        const confirmed = await showConfirm(
            'Delete Banner?',
            'Are you sure you want to permanently delete this banner? It will be removed from storage.',
            'warning',
            'Yes, delete it'
        );

        if (!confirmed.isConfirmed) return;

        try {
            const response = await deleteBannerApi(id);
            const isSuccess = response?.data?.result !== false && (response?.status >= 200 && response?.status < 300);

            if (isSuccess) {
                showToast(response?.data?.message || 'Banner deleted successfully', 'success');

                // Fallback to updating state locally to keep UI snappy, or simply refetch:
                setBanners(prev => prev.filter(banner => (banner._id || banner.id) !== id));

                // If the currently viewed preview is deleted or bounds shift, reset index
                if (currentPreviewIndex >= activeBanners.length - 1) {
                    setCurrentPreviewIndex(Math.max(0, activeBanners.length - 2));
                }
            } else {
                showToast(response?.data?.message || response?.response?.data?.message || 'Failed to delete banner', 'error');
            }
        } catch (error) {
            console.error('Delete Error:', error);
            showToast('Something went wrong while deleting.', 'error');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const response = await toggleBannerStatusApi(id, !currentStatus);
            const isSuccess = response?.data?.result !== false && (response?.status >= 200 && response?.status < 300);

            if (isSuccess) {
                // Optimistically toggle status in local state
                setBanners(prev => prev.map(banner => {
                    const bannerId = banner._id || banner.id;
                    if (bannerId === id) {
                        return { ...banner, isActive: !banner.isActive };
                    }
                    return banner;
                }));
                showToast(response?.data?.message || `Banner ${currentStatus ? 'deactivated' : 'activated'}`, 'success');
            } else {
                showToast(response?.data?.message || response?.response?.data?.message || 'Failed to toggle status', 'error');
            }
        } catch (error) {
            console.error('Toggle Status Error:', error);
            showToast('Something went wrong. Please try again.', 'error');
        }
    };

    const nextPreview = () => {
        setCurrentPreviewIndex((prev) => (prev + 1) % activeBanners.length);
    };

    const prevPreview = () => {
        setCurrentPreviewIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
    };

    // ── Render ────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 max-w-5xl animate-in fade-in duration-500 relative">
            {/* Header */}
            <div className="border-b border-gray-100 pb-6">
                <h1 className="text-2xl font-bold text-black tracking-tight">Banner Settings</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Customize landing page banners to keep your site fresh.
                </p>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-12">

                {/* 1. Preview Section */}
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-black">Banner Preview</h2>
                        <p className="text-sm text-gray-500">A glimpse of banners gracing your homepage</p>
                    </div>

                    <div className="relative w-full h-[400px] md:h-[500px] bg-black overflow-hidden rounded-2xl shadow-xl group">
                        {/* Background Image Carousel */}
                        <div className="absolute inset-0">
                            {loading ? (
                                <div className="w-full h-full animate-pulse bg-gray-800" />
                            ) : activeBanners.length > 0 ? (
                                <>
                                    {activeBanners.map((banner, index) => (
                                        <div
                                            key={banner._id || banner.id}
                                            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${index === currentPreviewIndex
                                                ? 'opacity-100 scale-100'
                                                : 'opacity-0 scale-110'
                                                }`}
                                        >
                                            <img
                                                src={banner.imageUrl || banner.url}
                                                alt={`Hero background ${index + 1}`}
                                                className="object-cover w-full h-full opacity-50"
                                                onError={e => { e.target.src = FALLBACK_IMAGE; }}
                                            />
                                        </div>
                                    ))}
                                    <div className="absolute inset-0 bg-linear-to-r from-gray-900 via-black/10 to-transparent"></div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                                    <HiOutlinePhotograph className="w-12 h-12 opacity-50" />
                                    <span className="text-sm font-medium">No banners uploaded yet</span>
                                </div>
                            )}
                        </div>

                        {/* Dummy Content */}
                        <div className="relative flex flex-col items-center justify-center h-full px-4 text-center text-white pb-16 pt-10">
                            {/* Trusted Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-3 mb-6 text-sm font-medium bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400">
                                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                </svg>
                                <span>Trusted by 10,000+ Donors</span>
                            </div>

                            <h1 className="max-w-4xl text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">
                                Empower Change, <br />
                                <span className="text-gray-300">Transform Lives</span>
                            </h1>

                            <p className="max-w-xl mt-4 text-sm text-gray-200 md:text-base">
                                Join thousands of compassionate individuals making a real difference.
                                Every rupee you donate goes directly to those in need.
                            </p>

                            <div className="flex flex-col gap-4 mt-8 sm:flex-row pointer-events-none">
                                <button
                                    className="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-black transition bg-white rounded-lg hover:bg-gray-100"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                    </svg>
                                    Quick Donation
                                </button>
                                <button className="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white transition border border-gray-400 rounded-lg hover:bg-white/10">
                                    View Projects
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Preview Navigation Overlays */}
                        {activeBanners.length > 1 && (
                            <>
                                <button
                                    onClick={prevPreview}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm z-10"
                                >
                                    <HiChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextPreview}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm z-10"
                                >
                                    <HiChevronRight className="w-6 h-6" />
                                </button>
                                {/* Indicators */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                    {activeBanners.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-1.5 rounded-full transition-all ${idx === currentPreviewIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* 2. Management Section */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-black">Manage Banners</h3>
                        <p className="text-sm text-gray-500">Control which banners appear on your homepage</p>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Add Banner Button */}
                        <div
                            onClick={() => setIsUploadModalOpen(true)}
                            className="relative shrink-0 w-40 h-28 sm:w-48 sm:h-32 rounded-xl border-2 border-dashed border-gray-300 hover:border-black bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-colors group"
                        >
                            <HiOutlinePlus className="w-6 h-6 text-gray-400 mb-2 group-hover:text-black group-hover:scale-110 transition-all" />
                            <span className="text-xs font-bold text-gray-500 group-hover:text-black transition-colors">Add Banner</span>
                        </div>

                        {/* Banner Thumbnails */}
                        {banners.map((banner, index) => (
                            <div
                                key={banner._id || banner.id}
                                className={`relative shrink-0 w-40 h-28 sm:w-48 sm:h-32 rounded-xl overflow-hidden shadow-sm group border-4 transition-all ${banner.isActive ? 'border-green-500' : 'border-transparent hover:border-gray-200'} `}
                            >
                                <img
                                    src={banner.imageUrl || banner.url}
                                    alt={`Banner ${index + 1} `}
                                    className={`w-full h-full object-cover transition-opacity ${!banner.isActive && 'opacity-50 grayscale'}`}
                                />

                                {/* Status Label */}
                                <div className="absolute top-2 left-2 z-10 pointer-events-none">
                                    <span
                                        className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded backdrop-blur-sm transition-colors ${banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
                                            }`}
                                    >
                                        {banner.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                {/* Hover Overlay Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[1px]">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(banner._id || banner.id, banner.isActive); }}
                                        className={`p-2 text-white rounded-lg shadow-lg transition-colors transform hover:scale-105 ${banner.isActive ? 'bg-gray-700 hover:bg-gray-800' : 'bg-green-600 hover:bg-green-700'
                                            }`}
                                        title={banner.isActive ? "Deactivate banner" : "Activate banner"}
                                    >
                                        {banner.isActive ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteBanner(banner._id || banner.id); }}
                                        className="p-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors transform hover:scale-105"
                                        title="Delete banner"
                                    >
                                        <HiOutlineTrash className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">

                        {/* Close Button */}
                        <button
                            onClick={closeUploadModal}
                            disabled={isUploading}
                            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                        >
                            <HiX className="w-5 h-5" />
                        </button>

                        <div className="p-8 space-y-8">

                            {/* Logo / Header */}
                            <div className="flex flex-col items-center space-y-4">
                                {/* Placeholder for NGO Logo, using a text stand-in */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold tracking-tight text-black">NGO</span>
                                    <span className="text-xl tracking-tight text-gray-500">Admin</span>
                                </div>
                                <h3 className="text-base font-bold text-gray-900">Upload New Banner</h3>
                            </div>

                            {/* Image Preview / State Area */}
                            <div className="relative h-48 w-full border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center group">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Upload preview"
                                        className="w-full h-full object-contain p-2"
                                    />
                                ) : (
                                    <span className="text-sm font-medium text-gray-400">No image selected</span>
                                )}

                                {/* Overlay to allow clicking the box to select image too */}
                                <div
                                    className={`absolute inset - 0 cursor - pointer ${previewUrl ? 'opacity-0 hover:opacity-10' : ''} bg - black transition - opacity`}
                                    onClick={() => fileInputRef.current?.click()}
                                />
                            </div>

                            {/* Actions */}
                            <div className="space-y-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    ref={fileInputRef}
                                    className="hidden"
                                    disabled={isUploading}
                                />

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 text-sm font-bold rounded-xl hover:border-black hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Click to Select Image
                                </button>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        onClick={closeUploadModal}
                                        disabled={isUploading}
                                        className="flex-1 py-3 px-4 border border-gray-200 text-black text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUploadSubmit}
                                        disabled={!selectedFile || isUploading}
                                        className="flex-1 py-3 px-4 bg-gray-200 text-black flex items-center justify-center gap-2 text-sm font-bold rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200"
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                                <span>Uploading...</span>
                                            </>
                                        ) : (
                                            'Upload Banner'
                                        )}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BannerSettings;
