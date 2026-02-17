import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHandsHelping, FaRegCheckCircle } from 'react-icons/fa';
import LoginPopup from './LoginPopup';
import DonationTypeModal from './DonationTypeModal';

const Navbar = ({ onQuickDonationOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProjectsOpen, setIsProjectsOpen] = useState(false);
    const [isMobileProjectsOpen, setIsMobileProjectsOpen] = useState(false);
    const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
    const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50 transition-all duration-300">
            <div className=" mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
                {/* Logo and desktop links... */}
                <div
                    className="flex items-center gap-2 cursor-pointer group/logo"
                    onClick={() => navigate('/')}
                >
                    <div className="flex items-center justify-center w-8 h-8 bg-black rounded-full shadow-lg shadow-black/10 transition-transform group-hover/logo:scale-110">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5 text-white"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                            />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-black tracking-tight">HopeConnect</span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center space-x-10">
                    <button
                        onClick={() => navigate('/')}
                        className={`relative text-sm font-bold transition-colors duration-300 py-1 ${isActive('/') ? 'text-black' : 'text-gray-500 hover:text-black'} after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-black after:transition-transform after:duration-300 ${isActive('/') ? 'after:scale-x-100' : 'hover:after:scale-x-100'}`}
                    >
                        Home
                    </button>

                    <button
                        onClick={() => navigate('/about-us')}
                        className={`relative text-sm font-bold transition-colors duration-300 py-1 ${isActive('/about-us') ? 'text-black' : 'text-gray-500 hover:text-black'} after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-black after:transition-transform after:duration-300 ${isActive('/about-us') ? 'after:scale-x-100' : 'hover:after:scale-x-100'}`}
                    >
                        About Us
                    </button>

                    <div
                        className="relative group h-full"
                        onMouseEnter={() => setIsProjectsOpen(true)}
                        onMouseLeave={() => setIsProjectsOpen(false)}
                    >
                        <button
                            className={`flex items-center gap-1.5 text-sm font-bold transition-colors duration-300 py-1 ${isProjectsOpen || isActive('/active-projects') || isActive('/completed-projects') ? 'text-black' : 'text-gray-500 hover:text-black'} after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-black after:transition-transform after:duration-300 ${isActive('/active-projects') || isActive('/completed-projects') ? 'after:scale-x-100' : ''}`}
                        >
                            Projects
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3.5 h-3.5 transition-transform duration-300 ${isProjectsOpen ? 'rotate-180' : ''}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>

                        <div className={`absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-64 bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl py-3 px-2 overflow-hidden transition-all duration-300 transform ${isProjectsOpen ? 'opacity-100 translate-y-0 visible scale-100' : 'opacity-0 -translate-y-2 invisible scale-95'}`}>
                            <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-2">
                                Discover More
                            </div>
                            <button
                                onClick={() => navigate('/active-projects')}
                                className={`group flex items-center justify-between w-full text-left px-3 py-3 rounded-xl transition-all ${isActive('/active-projects') ? 'text-black font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-black font-semibold'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive('/active-projects') ? 'bg-black text-white' : 'bg-gray-100 text-black group-hover:bg-black group-hover:text-white transition-colors'}`}>
                                        <FaHandsHelping className="w-4 h-4" />
                                    </div>
                                    <span className={`relative text-xs ${isActive('/active-projects') ? "after:content-[''] after:absolute after:w-full after:h-0.5 after:bottom-[-2px] after:left-0 after:bg-black" : ""}`}>Active Projects</span>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3.5 h-3.5 transition-transform duration-300 ${isActive('/active-projects') ? 'text-black translate-x-1 outline-none' : 'text-gray-300 group-hover:text-black group-hover:translate-x-1'}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                            <button
                                onClick={() => navigate('/completed-projects')}
                                className={`group flex items-center justify-between w-full text-left px-3 py-3 rounded-xl transition-all ${isActive('/completed-projects') ? 'text-black font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-black font-semibold'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive('/completed-projects') ? 'bg-black text-white' : 'bg-gray-100 text-black group-hover:bg-black group-hover:text-white transition-colors'}`}>
                                        <FaRegCheckCircle className="w-4 h-4" />
                                    </div>
                                    <span className={`relative text-xs ${isActive('/completed-projects') ? "after:content-[''] after:absolute after:w-full after:h-0.5 after:bottom-[-2px] after:left-0 after:bg-black" : ""}`}>Completed Projects</span>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3.5 h-3.5 transition-transform duration-300 ${isActive('/completed-projects') ? 'text-black translate-x-1 outline-none' : 'text-gray-300 group-hover:text-black group-hover:translate-x-1'}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center gap-4">
                    <button
                        onClick={() => setIsLoginPopupOpen(true)}
                        className="px-6 py-2.5 border border-black text-black text-sm font-bold rounded-full hover:bg-black hover:text-white transition-all duration-300"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsDonationModalOpen(true)}
                        className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-900 transition-all duration-300 shadow-md shadow-black/10 hover:shadow-black/20"
                    >
                        Donate Now
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="p-2 md:hidden text-black"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        {isMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 py-6 px-6 flex flex-col gap-5 animate-in slide-in-from-top duration-300">
                    <button
                        onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                        className={`text-lg font-bold text-left ${isActive('/') ? 'text-black' : 'text-gray-500'}`}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => { navigate('/about-us'); setIsMenuOpen(false); }}
                        className={`text-lg font-bold text-left ${isActive('/about-us') ? 'text-black' : 'text-gray-500'}`}
                    >
                        About Us
                    </button>

                    {/* Mobile Projects Collapsible */}
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => setIsMobileProjectsOpen(!isMobileProjectsOpen)}
                            className={`flex items-center justify-between text-lg font-bold text-left ${isActive('/active-projects') || isActive('/completed-projects') ? 'text-black' : 'text-gray-500'}`}
                        >
                            <span>Projects</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform duration-300 ${isMobileProjectsOpen ? 'rotate-180' : ''}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>

                        {isMobileProjectsOpen && (
                            <div className="flex flex-col gap-4 pl-4 border-l-2 border-gray-100 ml-1">
                                <button
                                    onClick={() => { navigate('/active-projects'); setIsMenuOpen(false); }}
                                    className={`flex items-center gap-3 text-sm font-semibold text-left ${isActive('/active-projects') ? 'text-black' : 'text-gray-500'}`}
                                >
                                    <FaHandsHelping className={`w-3.5 h-3.5 ${isActive('/active-projects') ? 'text-black' : 'text-gray-400'}`} />
                                    <span>Active Projects</span>
                                </button>
                                <button
                                    onClick={() => { navigate('/completed-projects'); setIsMenuOpen(false); }}
                                    className={`flex items-center gap-3 text-sm font-semibold text-left ${isActive('/completed-projects') ? 'text-black' : 'text-gray-500'}`}
                                >
                                    <FaRegCheckCircle className={`w-3.5 h-3.5 ${isActive('/completed-projects') ? 'text-black' : 'text-gray-400'}`} />
                                    <span>Completed Projects</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <button
                            onClick={() => { setIsLoginPopupOpen(true); setIsMenuOpen(false); }}
                            className="w-full py-4 bg-transparent text-black font-bold rounded-full border-2 border-black"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { setIsDonationModalOpen(true); setIsMenuOpen(false); }}
                            className="w-full py-4 bg-black text-white font-bold rounded-2xl shadow-lg"
                        >
                            Donate Now
                        </button>
                    </div>
                </div>
            )}
            {/* Popups */}
            {isLoginPopupOpen && <LoginPopup onClose={() => setIsLoginPopupOpen(false)} />}
            {isDonationModalOpen && (
                <DonationTypeModal
                    onClose={() => setIsDonationModalOpen(false)}
                    onQuickDonation={onQuickDonationOpen}
                />
            )}
        </nav>
    );
};

export default Navbar;
