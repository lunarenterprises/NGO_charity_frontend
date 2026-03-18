import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { getProjectDetailsApi } from '../../Services/userApi';
import { HiOutlinePlay } from 'react-icons/hi';
import ProjectDonationModal from '../Components/ProjectDonationModal';
import { useAuth } from '../../Contexts/AuthContext';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80';

const ProjectDetails = () => {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();
    const { onRequireLogin } = useOutletContext();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeMedia, setActiveMedia] = useState(null);
    const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            setLoading(true);
            try {
                const res = await getProjectDetailsApi(id);
                const data = res?.data?.project || res?.data?.data || res?.data || res?.project || res;
                if (data && Object.keys(data).length > 0) {
                    setProject(data);

                    // Set initial active media
                    let imgs = data.projectImages;
                    if (!Array.isArray(imgs)) {
                        try { imgs = JSON.parse(imgs); } catch { imgs = []; }
                    }
                    if (Array.isArray(imgs) && imgs.length > 0) {
                        setActiveMedia({ type: 'image', src: imgs[0] });
                    } else if (data.projectVideo) {
                        setActiveMedia({ type: 'video', src: data.projectVideo });
                    }
                } else {
                    setError("Project not found");
                }
            } catch (err) {
                console.error("Failed to fetch project details:", err);
                setError("Failed to load project details.");
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchProjectDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center pt-20">
                <div className="text-red-500 text-xl font-semibold mb-4">{error || "Project not found"}</div>
                <Link to="/" className="text-blue-500 underline">Go back home</Link>
            </div>
        );
    }

    const parseImages = (raw) => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; }
        catch { return []; }
    };

    const projectImages = parseImages(project.projectImages);
    const isVideoActive = activeMedia?.type === 'video';

    const title = project.name || "Untitled Project";
    const summary = project.summary || "No summary available.";
    const description = project.description || "No description available.";
    const pillText = project.category || (project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : "General");

    const currentAmt = parseFloat(project.currentAmount || 0);
    const targetAmt = parseFloat(project.targetAmount || 1);
    const progressPercent = Math.min(Math.round((currentAmt / targetAmt) * 100), 100);

    const raisedFormatted = `₹${currentAmt.toLocaleString('en-IN')}`;
    const targetFormatted = `₹${targetAmt.toLocaleString('en-IN')}`;

    return (
        <div className="min-h-screen bg-gray-50 font-sans pt-20">

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Media Gallery */}
                <div className="relative flex flex-col lg:block gap-6 mb-12">
                    {/* Main Viewport */}
                    <div className="lg:w-[75%] relative aspect-video rounded-2xl overflow-hidden bg-black shadow-xl shrink-0">
                        {isVideoActive && activeMedia?.src ? (
                            <video
                                src={activeMedia.src}
                                controls
                                className="w-full h-full object-contain bg-black"
                            />
                        ) : activeMedia?.src ? (
                            <div className="relative w-full h-full">
                                <img
                                    src={activeMedia.src}
                                    alt={title}
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
                            <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-100">
                                No media available
                            </div>
                        )}
                    </div>

                    {/* Sidebar Thumbnails */}
                    <div className="lg:col-span-3 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:absolute lg:right-0 lg:top-0 lg:h-full lg:w-[calc(25%-1.5rem)] custom-scrollbar pb-2 lg:pb-0">
                        {/* Video thumbnail */}
                        {project?.projectVideo && (
                            <div
                                onClick={() => setActiveMedia({ type: 'video', src: project.projectVideo })}
                                className={`shrink-0 relative aspect-video w-32 lg:w-full rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${isVideoActive ? 'border-black ring-4 ring-black/5' : 'border-transparent hover:border-gray-300'}`}
                            >
                                <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white top-0 left-0 hover:bg-gray-800 transition-colors">
                                    <HiOutlinePlay className="w-8 h-8 opacity-60 group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] mt-2 block">Watch Video</span>
                                </div>
                            </div>
                        )}

                        {/* Image thumbnails */}
                        {projectImages.map((img, idx) => (
                            <div
                                key={idx}
                                onClick={() => setActiveMedia({ type: 'image', src: img })}
                                className={`shrink-0 relative aspect-video w-32 lg:w-full rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${activeMedia?.type === 'image' && activeMedia?.src === img ? 'border-black ring-4 ring-black/5' : 'border-transparent hover:border-gray-300'}`}
                            >
                                <img
                                    src={img}
                                    alt={`Gallery ${idx + 1}`}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                    onError={e => { e.target.src = FALLBACK_IMAGE; }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2">
                        <span className="inline-block bg-gray-100 border text-black px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                            {pillText}
                        </span>
                        <h1 className="text-4xl font-bold text-black mb-6">{title}</h1>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8 whitespace-pre-wrap">
                            {summary}
                        </p>
                    </div>

                    {/* Right Column: Donation Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white px-8 py-5 rounded-2xl  sticky top-24 border-2 border-gray-300">
                            <div className="mb-6">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-3xl font-bold text-black">
                                        {project.status === 'completed' ? 'Completed' : raisedFormatted}
                                    </span>
                                    <span className="text-gray-500 mb-1">
                                        {project.status === 'completed' ? `Target: ${targetFormatted}` : `raised of ${targetFormatted}`}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3">
                                    <div
                                        className={`bg-black h-3 rounded-full ${project.status !== 'completed' ? 'transition-all duration-1000' : ''}`}
                                        style={{ width: project.status === 'completed' ? '100%' : `${progressPercent}%` }}
                                    ></div>
                                </div>
                            </div>

                            {project.status !== 'completed' ? (
                                <button
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            onRequireLogin();
                                        } else {
                                            setIsDonationModalOpen(true);
                                        }
                                    }}
                                    className="w-full py-3 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-900 transition-colors shadow-lg mb-4"
                                >
                                    Donate Now
                                </button>
                            ) : (
                                <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-lg text-center mb-4 border border-gray-200">
                                    Goal Reached
                                </div>
                            )}

                            <p className="text-center text-sm text-gray-500">
                                {project.status === 'completed'
                                    ? "This project has been successfully funded."
                                    : "All donations are tax-deductible."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Description Section */}
                <div className="sm:pt-0 pt-10">
                    <h3 className="text-2xl font-bold mb-3 text-black">About this Project</h3>
                    <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                        {description}
                    </div>
                </div>
            </div>

            <ProjectDonationModal
                isOpen={isDonationModalOpen}
                onClose={() => setIsDonationModalOpen(false)}
                project={project}
            />
        </div>
    );
};

export default ProjectDetails;
