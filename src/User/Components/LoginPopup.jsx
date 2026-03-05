import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { registerApi, sendOtpApi, loginApi } from '../../Services/userApi';
import { showAlert } from '../../Utils/alert';
import { useAuth } from '../../Contexts/AuthContext';

const LoginPopup = ({ onClose }) => {
    const { login } = useAuth();
    const portalRoot = document.body;
    const [isLogin, setIsLogin] = useState(true);
    const [otpSent, setOtpSent] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone: '',
    });
    const [otpArray, setOtpArray] = useState(['', '', '', '']);

    useEffect(() => {
        let timer;
        if (otpSent && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setCanResend(true);
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [otpSent, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (isLogin && name === 'email') {
            setFormData({ ...formData, email: value, phone: '' });
        } else if (isLogin && name === 'phone') {
            setFormData({ ...formData, phone: value, email: '' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        setError('');
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otpArray];
        newOtp[index] = value.slice(-1);
        setOtpArray(newOtp);
        setError('');

        if (value && index < 3) {
            const nextInput = document.getElementById(`user-otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
            const prevInput = document.getElementById(`user-otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, 4).split('');
        if (pasteData.every(char => /^\d$/.test(char))) {
            const newOtp = [...otpArray];
            pasteData.forEach((char, i) => {
                if (i < 4) newOtp[i] = char;
            });
            setOtpArray(newOtp);
            const lastIndex = Math.min(pasteData.length - 1, 3);
            document.getElementById(`user-otp-${lastIndex}`)?.focus();
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;
        setLoading(true);
        try {
            const payload = formData.email ? { email: formData.email } : { phone: formData.phone };
            const result = await sendOtpApi(payload);
            if (result.status === 200) {
                setTimeLeft(120);
                setCanResend(false);
                setOtpArray(['', '', '', '']);
                setError('');
            }
        } catch (err) {
            setError('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            if (!otpSent) {
                // Send OTP
                if (!formData.email && !formData.phone) {
                    setError('Please enter Email or Phone');
                    return;
                }
                setLoading(true);
                try {
                    const payload = formData.email ? { email: formData.email } : { phone: formData.phone };
                    const result = await sendOtpApi(payload);
                    if (result.status === 200) {
                        setOtpSent(true);
                        setTimeLeft(120);
                        setCanResend(false);
                    } else {
                        setError(result.response?.data?.message || 'Failed to send OTP');
                    }
                } catch (err) {
                    setError('Something went wrong');
                } finally {
                    setLoading(false);
                }
            } else {
                // Verify OTP & Login
                const otpValue = otpArray.join('');
                if (otpValue.length < 4) {
                    setError('Please enter 4-digit OTP');
                    return;
                }
                setLoading(true);
                try {
                    const payload = formData.email ? { email: formData.email } : { phone: formData.phone };
                    const result = await loginApi({ ...payload, otp: otpValue });
                    if (result.status === 200) {
                        const { accessToken, refreshToken, user } = result.data.data;
                        login(user, { accessToken, refreshToken });

                        onClose();
                        showAlert("Welcome Back!", "Login successful", "success");
                    } else {
                        setError(result.response?.data?.message || 'Invalid OTP');
                    }
                } catch (err) {
                    setError('Login failed');
                } finally {
                    setLoading(false);
                }
            }
        } else {
            // Register
            if (!formData.fullname || !formData.email || !formData.phone) {
                setError('All fields are required');
                return;
            }
            setLoading(true);
            try {
                const result = await registerApi({
                    fullname: formData.fullname,
                    email: formData.email,
                    phone: formData.phone
                });
                if (result.status === 200 || result.status === 201) {
                    showAlert("Welcome!", 'Registration successful! Please login.', "success");
                    setIsLogin(true);
                } else {
                    setError(result.response?.data?.message || 'Registration failed');
                }
            } catch (err) {
                setError('Something went wrong during registration');
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setOtpSent(false);
        setError('');
        setOtpArray(['', '', '', '']);
        setFormData({
            fullname: '',
            email: '',
            phone: '',
        });
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
                                ? (otpSent ? "Enter the 4-digit code sent to your device" : 'Sign in using Email or Phone Number')
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
                                        name="fullname"
                                        value={formData.fullname}
                                        onChange={handleInputChange}
                                        placeholder="Your Name"
                                        className="w-full px-5 py-4 bg-gray-200 border border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all duration-200 text-sm font-semibold text-black"
                                    />
                                </div>
                            )}

                            {/* Email Field */}
                            {(!isLogin || (isLogin && !otpSent)) && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="yourname@example.com"
                                        className="w-full px-5 py-4 bg-gray-200 border border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all duration-200 text-sm font-semibold text-black"
                                    />
                                </div>
                            )}

                            {/* OR Divider for Login */}
                            {isLogin && !otpSent && (
                                <div className="text-center pt-2 text-[15px] font-bold text-gray-400 uppercase tracking-widest ">
                                    OR
                                </div>
                            )}

                            {/* Phone Field */}
                            {(!isLogin || (isLogin && !otpSent)) && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+91 00000 00000"
                                        className="w-full px-4 py-3 bg-gray-200 border border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all duration-200 text-sm font-semibold text-black"
                                    />
                                </div>
                            )}

                            {/* OTP Field (Visible only when otpSent is true) */}
                            {isLogin && otpSent && (
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            4-Digit OTP
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setOtpSent(false)}
                                            className="text-[10px] font-bold text-black border-b border-black hover:border-transparent transition-all uppercase tracking-wider"
                                        >
                                            Change?
                                        </button>
                                    </div>
                                    <div className="flex justify-center gap-3">
                                        {otpArray.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`user-otp-${index}`}
                                                type="text"
                                                maxLength="1"
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(index, e)}
                                                onPaste={handlePaste}
                                                className={`w-12 h-14 bg-gray-200 border-2 border-transparent rounded-xl text-center text-xl font-black text-black outline-none transition-all duration-200 focus:bg-white focus:border-black ${digit ? 'border-black bg-white' : ''}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-center mt-2">
                                        {canResend ? (
                                            <button
                                                type="button"
                                                onClick={handleResendOtp}
                                                className="text-[10px] font-bold text-black border-b border-black hover:border-transparent transition-all uppercase tracking-widest cursor-pointer"
                                            >
                                                Resend code
                                            </button>
                                        ) : (
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                Resend code in <span className="text-black">{formatTime(timeLeft)}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">{error}</p>}

                        <button
                            disabled={loading}
                            className="w-full py-4 bg-black text-white text-sm font-bold rounded-2xl hover:bg-gray-900 transition-all duration-300 shadow-xl shadow-black/10 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : (isLogin ? (otpSent ? 'Verify & Login' : 'Send OTP') : 'Join the Community')}
                        </button>
                    </form>

                    <div className="mt-5 text-center text-sm">
                        <p className="text-gray-500 font-medium">
                            {isLogin ? "New to Yashfi Foundation?" : "Already a supporter?"}
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
