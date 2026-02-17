import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { IoClose } from 'react-icons/io5';

const LoginPopup = ({ onClose }) => {
    const portalRoot = document.body;
    const [isLogin, setIsLogin] = useState(true);

    const modalContent = (
        <div className="fixed inset-0 z-100 grid place-items-center p-4 bg-black/20 backdrop-blur-[5px] animate-in fade-in duration-300">
            <div
                className={`relative w-full ${isLogin ? 'max-w-md' : 'max-w-2xl'} bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 transition-all duration-500`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-4 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                    <IoClose className="w-6 h-6" />
                </button>

                <div className="p-8 md:p-12">
                    <div className="mb-10 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-black rounded-2xl shadow-lg shadow-black/10">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-6 h-6 text-white"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-black tracking-tight">
                            {isLogin ? 'Welcome Back' : 'Join Our Mission'}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 font-medium">
                            {isLogin ? 'Sign in to continue your journey of giving' : 'Become a part of our community and help create lasting change'}
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className={isLogin ? 'space-y-6' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        className="w-full px-5 py-4 bg-gray-200 border border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all duration-200 text-sm font-semibold"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="yourname@example.com"
                                    className="w-full px-5 py-4 bg-gray-200 border border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all duration-200 text-sm font-semibold"
                                />
                            </div>

                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+91 00000 00000"
                                        className="w-full px-5 py-4 bg-gray-200 border border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all duration-200 text-sm font-semibold"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        Password
                                    </label>
                                    {isLogin && (
                                        <button className="text-[10px] font-bold text-black hover:underline uppercase tracking-wider">
                                            Forgot?
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 bg-gray-200 border border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all duration-200 text-sm font-semibold"
                                />
                            </div>
                        </div>

                        <button className="w-full py-4 bg-black text-white text-sm font-bold rounded-2xl hover:bg-gray-900 transition-all duration-300 shadow-xl shadow-black/10">
                            {isLogin ? 'Sign In' : 'Join the Community'}
                        </button>
                    </form>

                    <div className="mt-10 text-center text-sm">
                        <p className="text-gray-500 font-medium">
                            {isLogin ? "New to HopeConnect?" : "Already a supporter?"}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="font-bold text-black hover:underline ml-1"
                            >
                                {isLogin ? 'Become a Supporter' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* Overlay background click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );

    return ReactDOM.createPortal(modalContent, portalRoot);
};

export default LoginPopup;
