import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { IoClose } from 'react-icons/io5';

const LoginPopup = ({ onClose }) => {
    const portalRoot = document.body;
    const [isLogin, setIsLogin] = useState(true);
    const [otpSent, setOtpSent] = useState(false);

    const handleAuthAction = (e) => {
        e.preventDefault();
        if (isLogin && !otpSent) {
            setOtpSent(true);
        } else {
            // Final submit logic here
            console.log("Auth Action Triggered");
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setOtpSent(false); // Reset OTP state when switching modes
    };

    const modalContent = (
        <div className="fixed inset-0 z-100 grid place-items-center p-4 bg-black/20 backdrop-blur-[5px] animate-in fade-in duration-300">
            <div
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 transition-all duration-500"
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
                    <div className="mb-6 text-center">
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
                            {isLogin ? (otpSent ? 'Verify Identity' : 'Welcome Back') : 'Join Our Mission'}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 font-medium px-4">
                            {isLogin
                                ? (otpSent ? "Enter the 6-digit code sent to your device" : 'Sign in using Email or Phone Number')
                                : 'Become a part of our community and help create lasting change'}
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleAuthAction}>
                        <div className="space-y-4 pb-4">
                            {/* Registration Fields */}
                            {!isLogin && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        className="w-full px-5 py-4 bg-gray-200 border border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all duration-200 text-sm font-semibold text-black"
                                    />
                                </div>
                            )}

                            {/* Login: ID Entry or Registration: Email */}
                            {(isLogin ? !otpSent : true) && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                        {isLogin ? 'Email or Phone Number' : 'Email Address'}
                                    </label>
                                    <input
                                        type={isLogin ? "text" : "email"}
                                        placeholder={isLogin ? "Enter Email or Phone" : "yourname@example.com"}
                                        className="w-full px-5 py-4 bg-gray-200 border border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all duration-200 text-sm font-semibold text-black"
                                    />
                                </div>
                            )}

                            {/* Registration: Phone */}
                            {!isLogin && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+91 00000 00000"
                                        className="w-full px-5 py-4 bg-gray-200 border border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all duration-200 text-sm font-semibold text-black"
                                    />
                                </div>
                            )}

                            {/* OTP Field (Visible only when otpSent is true) */}
                            {isLogin && otpSent && (
                                <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            6-Digit OTP
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setOtpSent(false)}
                                            className="text-[10px] font-bold text-black border-b border-black hover:border-transparent transition-all uppercase tracking-wider"
                                        >
                                            Change?
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="000000"
                                        className="w-full px-5 py-4 bg-gray-100 border-2 border-dashed border-gray-200 rounded-2xl focus:bg-white focus:border-black focus:ring-0 focus:border-solid outline-none transition-all duration-200 text-center text-xl font-black tracking-[0.5em] text-black"
                                    />
                                    <div className="flex justify-center mt-2">
                                        <button type="button" className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest">
                                            Haven't received it? <span className="text-black underline">Resend code</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="w-full py-4 bg-black text-white text-sm font-bold rounded-2xl hover:bg-gray-900 transition-all duration-300 shadow-xl shadow-black/10">
                            {isLogin ? (otpSent ? 'Verify & Login' : 'Send OTP') : 'Join the Community'}
                        </button>
                    </form>

                    <div className="mt-5 text-center text-sm">
                        <p className="text-gray-500 font-medium">
                            {isLogin ? "New to HopeConnect?" : "Already a supporter?"}
                            <button
                                onClick={toggleMode}
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
