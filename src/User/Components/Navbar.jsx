import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHandsHelping, FaRegCheckCircle } from 'react-icons/fa';
import LoginPopup from './LoginPopup';
import DonationTypeModal from './DonationTypeModal';
import { useAuth } from '../../Contexts/AuthContext';

const Navbar = ({ onQuickDonationOpen }) => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProjectsOpen, setIsProjectsOpen] = useState(false);
    const [isMobileProjectsOpen, setIsMobileProjectsOpen] = useState(false);
    const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
    const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        navigate('/');
    };

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
                    <span className="text-xl font-bold text-black tracking-tight">Yashfi Foundation</span>
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

                        <div className={`absolute top-[calc(100%+33px)] left-1/2 -translate-x-1/2 w-64 bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl py-3 px-2 overflow-hidden transition-all duration-300 transform ${isProjectsOpen ? 'opacity-100 translate-y-0 visible scale-100' : 'opacity-0 -translate-y-2 invisible scale-95'} before:content-[''] before:absolute before:w-full before:h-10 before:-top-10 before:left-0`}>
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
                        onClick={() => setIsDonationModalOpen(true)}
                        className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-900 transition-all duration-300 shadow-md shadow-black/10 hover:shadow-black/20"
                    >
                        Donate Now
                    </button>

                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-all duration-300  border-2 border-gray-300"
                            >
                                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold">
                                    {(user.fullname || user.username || user.email || "?").charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left hidden lg:block">
                                    <p className="text-xs font-bold text-black leading-none">{(user.fullname || user.username || "User").split(' ')[0]}</p>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>

                            {/* Profile Dropdown */}
                            <div className={`absolute right-0 mt-6 w-72 bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden transition-all duration-300 transform origin-top-right ${isProfileOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}`}>
                                <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white text-lg font-bold shadow-xl shadow-black/10">
                                            {(user.fullname || user.username || user.email || "?").charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-black truncate w-44">{user.fullname || user.username || "User"}</h4>
                                            <p className="text-[11px] font-semibold text-gray-400 truncate w-44">{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <button
                                        onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
                                        className="flex items-center gap-3 w-full px-3 py-3 text-xs font-bold text-gray-600 hover:bg-gray-100  hover:text-black rounded-xl transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                            </svg>
                                        </div>
                                        My Profile
                                    </button>
                                    <button
                                        onClick={() => { navigate('/transactions'); setIsProfileOpen(false); }}
                                        className="flex items-center gap-3 w-full px-3 py-3 text-xs font-bold text-gray-600 hover:bg-gray-100 hover:text-black rounded-xl transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 17.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                            </svg>
                                        </div>
                                        View Transactions
                                    </button>
                                    <div className="h-px bg-gray-50 my-1 mx-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-3 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 rotate-180">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                                            </svg>
                                        </div>
                                        Sign Out Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsLoginPopupOpen(true)}
                            className="px-6 py-2.5 border border-black text-black text-sm font-bold rounded-full hover:bg-black hover:text-white transition-all duration-300"
                        >
                            Login
                        </button>
                    )}

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
                    {/* User Profile in Mobile Menu */}
                    {user && (
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-2 border border-gray-100 font-bold transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white text-lg font-bold shadow-xl shadow-black/10">
                                {(user.fullname || user.username || user.email || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-black truncate w-44">{user.fullname || user.username || "User"}</h4>
                                <p className="text-[11px] font-semibold text-gray-400 truncate w-44">{user.email}</p>
                            </div>
                        </div>
                    )}

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
                        {user ? (
                            <>
                                <button
                                    onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                                    className="w-full py-4 px-6 flex items-center justify-between bg-gray-50 text-black font-bold rounded-full border border-gray-100"
                                >
                                    <span>My Profile</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => { navigate('/transactions'); setIsMenuOpen(false); }}
                                    className="w-full py-4 px-6 flex items-center justify-between bg-gray-50 text-black font-bold rounded-full border border-gray-100"
                                >
                                    <span>View Transactions</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-4 bg-transparent text-red-500 font-bold rounded-full border-2 border-red-500 transition-colors hover:bg-red-50"
                                >
                                    Logout Account
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => { setIsLoginPopupOpen(true); setIsMenuOpen(false); }}
                                className="w-full py-4 bg-transparent text-black font-bold rounded-full border-2 border-black hover:bg-black hover:text-white transition-all"
                            >
                                Login
                            </button>
                        )}
                        <button
                            onClick={() => { setIsDonationModalOpen(true); setIsMenuOpen(false); }}
                            className="w-full py-4 bg-black text-white font-bold rounded-2xl shadow-lg"
                        >
                            Donate Now
                        </button>
                    </div>
                </div>
            )}
            {isLoginPopupOpen && <LoginPopup onClose={() => setIsLoginPopupOpen(false)} />}
            {isDonationModalOpen && (
                <DonationTypeModal
                    onClose={() => setIsDonationModalOpen(false)}
                    onQuickDonation={onQuickDonationOpen}
                    onRequireLogin={() => {
                        setIsDonationModalOpen(false);
                        setIsLoginPopupOpen(true);
                    }}
                />
            )}
        </nav>
    );
};

export default Navbar;
