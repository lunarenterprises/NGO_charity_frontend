import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlinePlus, HiX, HiOutlineCloudUpload } from 'react-icons/hi';

const ActiveProjects = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        summary: '',
        description: '',
        images: [],
        video: null
    });
    const [imagePreviews, setImagePreviews] = useState([]);

    const projects = [
        {
            id: 1,
            category: "Water & Sanitation",
            title: "Clean Water for Villages",
            target: "₹5,00,000",
            raised: "₹3,25,000",
            progress: 65,
            status: "Active",
            updatedAt: "2h ago",
            image: "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 2,
            category: "Education",
            title: "Education for All",
            target: "₹8,00,000",
            raised: "₹6,82,000",
            progress: 85,
            status: "Active",
            updatedAt: "5h ago",
            image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 3,
            category: "Healthcare",
            title: "Medical Camp Initiative",
            target: "₹3,00,000",
            raised: "₹1,85,000",
            progress: 60,
            status: "Active",
            updatedAt: "1d ago",
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 4,
            category: "Hunger",
            title: "Food for Everyone",
            target: "₹2,50,000",
            raised: "₹1,20,000",
            progress: 48,
            status: "Active",
            updatedAt: "2d ago",
            image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 5,
            category: "Environment",
            title: "Green Earth Project",
            target: "₹2,00,000",
            raised: "₹95,000",
            progress: 47,
            status: "Active",
            updatedAt: "3d ago",
            image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        }
    ];

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
        };
    }, [imagePreviews]);

    const handleFormChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            if (name === 'images') {
                const newFiles = Array.from(files);
                const currentImagesCount = formData.images.length;
                const remainingSlots = 4 - currentImagesCount;

                if (remainingSlots <= 0) return;

                const slicedFiles = newFiles.slice(0, remainingSlots);
                const newPreviews = slicedFiles.map(file => ({
                    id: Math.random().toString(36).substr(2, 9),
                    file,
                    url: URL.createObjectURL(file)
                }));

                setImagePreviews(prev => [...prev, ...newPreviews]);
                setFormData(prev => ({ ...prev, images: [...prev.images, ...slicedFiles] }));
            } else {
                setFormData(prev => ({ ...prev, [name]: files[0] }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const removeImage = (id) => {
        setImagePreviews(prev => {
            const filtered = prev.filter(img => img.id !== id);
            const removed = prev.find(img => img.id === id);
            if (removed) URL.revokeObjectURL(removed.url);
            return filtered;
        });

        // This is a bit simplified since we map by index or id in previews but formData just has the File list
        // Updating formData.images based on index from previews would be safer
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, idx) => {
                const preview = imagePreviews[idx];
                return preview && preview.id !== id;
            })
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Project Data:', { ...formData, imagePreviews });
        setIsModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
        setFormData({ name: '', summary: '', description: '', images: [], video: null });
        setImagePreviews([]);
    };

    return (
        <div className="space-y-8 relative">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-2xl font-bold text-black tracking-tight">Active Projects</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor and manage ongoing NGO initiatives.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold rounded uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    New Project
                </button>
            </div>

            {/* Content Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div key={project.id} className="bg-white border border-gray-100 rounded-lg shadow-sm hover:border-black transition-all group flex flex-col h-full overflow-hidden">
                        {/* Project Image Overlay */}
                        <div className="relative h-48 overflow-hidden bg-gray-100">
                            <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                <button className="p-2.5 bg-white text-black rounded shadow-md hover:bg-gray-100 transition-colors">
                                    <HiOutlinePencilAlt className="w-5 h-5" />
                                </button>
                                <button className="p-2.5 bg-red-600 text-white rounded shadow-md hover:bg-red-700 transition-colors">
                                    <HiOutlineTrash className="w-5 h-5" />
                                </button>
                            </div>
                            <span className="absolute top-4 left-4 px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm border border-gray-200 text-teal-700 text-[9px] font-black uppercase tracking-tighter shadow-sm">
                                {project.status}
                            </span>
                        </div>

                        {/* Project Info */}
                        <div className="p-6 space-y-4 grow">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    {project.category}
                                </span>
                                <h3 className="text-lg font-bold text-black leading-tight group-hover:underline transition-all underline-offset-4">
                                    {project.title}
                                </h3>
                            </div>

                            {/* Progress Section */}
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Raised</span>
                                        <span className="text-sm font-black text-black">{project.raised}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target</span>
                                        <span className="text-sm font-bold text-gray-500">{project.target}</span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-black transition-all duration-700 ease-out shadow-sm"
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <span className="text-black font-bold">{project.progress}% Complete</span>
                                    <span className="italic">Updated {project.updatedAt}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-6 pb-6 mt-auto flex gap-3">
                            <button
                                onClick={() => navigate(`/admin/active-projects/${project.id}`)}
                                className="grow py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all rounded shadow-sm"
                            >
                                View Details
                            </button>
                            <button
                                onClick={() => navigate(`/admin/active-projects/${project.id}#recent-contributions`)}
                                className="grow py-2.5 bg-white border border-black text-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded shadow-sm"
                            >
                                Analytics
                            </button>
                        </div>
                    </div>
                ))}

                {/* Create New Placeholder Card */}
                <div
                    onClick={() => setIsModalOpen(true)}
                    className="border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-black transition-all bg-gray-50/20 h-full min-h-[400px]"
                >
                    <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                        <HiOutlinePlus className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-black">Add New Initiative</span>
                </div>
            </div>

            {/* NEW PROJECT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsModalOpen(false); resetForm(); }}></div>
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
                                    <input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                        type="text"
                                        placeholder="e.g. Rural Education Empowerment"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-all"
                                    />
                                </div>

                                {/* Summary */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block px-1">Concept Summary</label>
                                    <textarea
                                        required
                                        name="summary"
                                        value={formData.summary}
                                        onChange={handleFormChange}
                                        rows="2"
                                        placeholder="Brief 1-2 sentence overview of the initiative..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-all resize-none"
                                    ></textarea>
                                </div>

                                {/* Full Description */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block px-1">Full Description</label>
                                    <textarea
                                        required
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        rows="4"
                                        placeholder="Detailed project requirements, goals, and impact plan..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-all resize-none"
                                    ></textarea>
                                </div>

                                {/* Media Uploads */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block px-1">Project Images (Max 4)</label>
                                            <div className={`relative group ${formData.images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <input
                                                    type="file"
                                                    name="images"
                                                    accept="image/*"
                                                    multiple
                                                    disabled={formData.images.length >= 4}
                                                    onChange={handleFormChange}
                                                    className={`absolute inset-0 w-full h-full opacity-0 ${formData.images.length >= 4 ? 'cursor-not-allowed' : 'cursor-pointer'} z-10`}
                                                />
                                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 group-hover:border-black transition-all bg-gray-50">
                                                    <HiOutlineCloudUpload className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors" />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                                                        Add Images
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block px-1">Intro Video</label>
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    name="video"
                                                    accept="video/*"
                                                    onChange={handleFormChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 group-hover:border-black transition-all bg-gray-50">
                                                    <HiOutlineCloudUpload className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors" />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        {formData.video ? formData.video.name : 'Choose Video'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Previews Grid */}
                                    {imagePreviews.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Selected Images ({imagePreviews.length})</p>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                                {imagePreviews.map((preview) => (
                                                    <div key={preview.id} className="relative aspect-square group">
                                                        <img src={preview.url} alt="preview" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(preview.id)}
                                                            className="absolute -top-1.5 -right-1.5 bg-black text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                        >
                                                            <HiX className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {imagePreviews.length < 4 && (
                                                    <div className="relative aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center group cursor-pointer hover:border-black transition-all">
                                                        <input
                                                            type="file"
                                                            name="images"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={handleFormChange}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        />
                                                        <HiOutlinePlus className="w-5 h-5 text-gray-300 group-hover:text-black" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    className="grow py-4 border border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="grow py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-gray-800 transition-all shadow-lg"
                                >
                                    Publish Initiative
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
