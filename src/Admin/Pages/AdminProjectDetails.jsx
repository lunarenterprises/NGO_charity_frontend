import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
    HiOutlineArrowLeft,
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiOutlineCalendar,
    HiOutlineTag,
    HiOutlineGlobeAlt,
    HiOutlinePlay
} from 'react-icons/hi';

const AdminProjectDetails = () => {
    const { id } = useParams();

    // Mock data - In a real app, this would be fetched based on 'id'
    const project = {
        id: id,
        category: "Water & Sanitation",
        title: "Clean Water for Villages",
        target: "₹5,00,000",
        raised: "₹3,25,000",
        progress: 65,
        status: "Active",
        updatedAt: "2h ago",
        startDate: "Jan 12, 2026",
        location: "Dharmapuri, Tamil Nadu",
        summary: "Providing sustainable clean water solutions through borewells and filtration systems to 5 major villages.",
        description: `This project aims to address the acute water crisis in rural Dharmapuri. We are implementing a dual-phase strategy:
        
        1. Excavation: Drilling deep borewells in strategic locations identified by hydrogeological surveys.
        2. Filtration: Installing solar-powered RO filtration units to ensure the water is safe for consumption.
        
        The initiative will directly benefit over 1,200 families who currently walk more than 5km daily for potable water. Your management of this project ensures these systems stay operational and the community thrives.`,
        images: [
            "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1541544741938-0af808871cc0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1538300342682-cf57afb97285?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        ],
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Example embed URL
    };

    // Mock data for donors
    const donors = [
        { id: 1, name: "Ananya Sharma", email: "ananya.s@example.com", phone: "+91 98765 43210", date: "Feb 15, 2026", amount: "₹25,000" },
        { id: 2, name: "Rahul Verma", email: "rahul.v@example.com", phone: "+91 87654 32109", date: "Feb 14, 2026", amount: "₹10,000" },
        { id: 3, name: "Priya Patel", email: "priya.p@example.com", phone: "+91 76543 21098", date: "Feb 12, 2026", amount: "₹50,000" },
        { id: 4, name: "Amit Singh", email: "amit.s@example.com", phone: "+91 65432 10987", date: "Feb 10, 2026", amount: "₹15,000" },
        { id: 5, name: "Sneha Reddy", email: "sneha.r@example.com", phone: "+91 54321 09876", date: "Feb 08, 2026", amount: "₹5,000" },
    ];

    const [activeMedia, setActiveMedia] = useState({ type: 'video', src: project.videoUrl });
    const location = useLocation();

    useEffect(() => {
        if (location.hash === '#recent-contributions') {
            const element = document.getElementById('recent-contributions');
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-['Poppins']">
            {/* Top Navigation & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-8">
                <div className="flex items-center gap-4">
                    <Link
                        to="/admin/active-projects"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black"
                    >
                        <HiOutlineArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-black tracking-tight">{project.title}</h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                            Project ID: <span className="text-black">#{project.id}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            Status: <span className="text-teal-600">Active Listing</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 text-black text-[10px] font-black uppercase tracking-widest rounded hover:border-black hover:bg-gray-50 transition-all shadow-sm">
                        <HiOutlinePencilAlt className="w-4 h-4" />
                        Edit Project
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-red-700 transition-all shadow-sm">
                        <HiOutlineTrash className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Interactive Media Gallery Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                {/* Main Viewport */}
                <div className="lg:col-span-9 relative aspect-video rounded-xl overflow-hidden bg-black border border-gray-200">
                    {activeMedia.type === 'video' ? (
                        <iframe
                            src={activeMedia.src}
                            title="Project Video"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="relative w-full h-full animate-in zoom-in-95 duration-300">
                            <img
                                src={activeMedia.src}
                                alt="Selected Project Media"
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setActiveMedia({ type: 'video', src: project.videoUrl })}
                                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg"
                            >
                                <HiOutlinePlay className="w-4 h-4" />
                                Return to Video
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar Gallery */}
                <div className="lg:col-span-3 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[min(50vw,500px)] custom-scrollbar pb-2 lg:pb-0">
                    <div
                        onClick={() => setActiveMedia({ type: 'video', src: project.videoUrl })}
                        className={`flex-shrink-0 relative aspect-video w-32 lg:w-full rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${activeMedia.type === 'video' ? 'border-black ring-4 ring-black/5' : 'border-transparent hover:border-gray-300'}`}
                    >
                        <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white p-4">
                            <HiOutlinePlay className="w-8 h-8 opacity-60 group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] mt-2 block">Watch Video</span>
                        </div>
                    </div>
                    {project.images.map((img, idx) => (
                        <div
                            key={idx}
                            onClick={() => setActiveMedia({ type: 'image', src: img })}
                            className={`flex-shrink-0 relative aspect-video w-32 lg:w-full rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${activeMedia.type === 'image' && activeMedia.src === img ? 'border-black ring-4 ring-black/5' : 'border-transparent hover:border-gray-300'}`}
                        >
                            <img
                                src={img}
                                alt={`Gallery item ${idx}`}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Text Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Description Section */}
                    <div className="bg-white border border-gray-100 rounded-xl space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Project Concept</h2>
                            <p className="text-lg font-bold text-black leading-relaxed italic border-l-4 border-black pl-6">
                                "{project.summary}"
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Detailed Impact Strategy</h2>
                            <div className="text-sm text-gray-600 leading-loose whitespace-pre-wrap font-medium">
                                {project.description}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="space-y-6">
                        {/* Funding Section */}
                        <div className="bg-black text-white p-8 rounded-xl shadow-xl space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Raised</p>
                                        <h3 className="text-3xl font-black">{project.raised}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Target</p>
                                        <p className="text-lg font-bold text-gray-300">{project.target}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white transition-all duration-1000 ease-out"
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span>{project.progress}% Complete</span>
                                        <span className="text-gray-400">Updated {project.updatedAt}</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded hover:bg-gray-100 transition-all shadow-lg font-['Poppins']">
                                Download Revenue Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Donor List Section - Full Width */}
            <div id="recent-contributions" className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 bg-black flex justify-between items-center">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Recent Contributions</h2>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{donors.length} Donors</span>
                </div>
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
                            {donors.map((donor) => (
                                <tr key={donor.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-black group-hover:underline transition-all underline-offset-4 decoration-gray-300">{donor.name}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500 font-medium tracking-tight">{donor.email}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500 font-medium tracking-tight">{donor.phone}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500 font-medium text-center">{donor.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-black text-black bg-gray-100 px-3 py-1 rounded-md">{donor.amount}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {donors.length === 0 && (
                    <div className="p-20 text-center bg-gray-50/30">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">No recorded project contributions.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProjectDetails;
