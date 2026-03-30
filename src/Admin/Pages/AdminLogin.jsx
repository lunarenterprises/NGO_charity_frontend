import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminSendOtpApi, adminVerifyOtpApi } from '../../Services/adminApi';
import { AiOutlineUser, AiOutlineArrowRight, AiOutlineSafetyCertificate } from 'react-icons/ai';
import { useAuth } from '../../Contexts/AuthContext';
import { COUNTRY_CODES } from '../../Constants/countryCodes';

const AdminLogin = () => {
    const { login } = useAuth();
    const [adminData, setAdminData] = useState({
        email: '',
        phone: '',
        countryCode: '+91',
        otp: ''
    });
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120);
    const [canResend, setCanResend] = useState(false);
    const navigate = useNavigate();

    const [otp, setOtp] = useState(['', '', '', '']);

    React.useEffect(() => {
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

    const handleResendOtp = async () => {
        if (!canResend) return;

        const payload = adminData.email ? { email: adminData.email } : { phone: adminData.phone, countryCode: adminData.countryCode };

        setLoading(true);
        try {
            const result = await adminSendOtpApi(payload);
            if (result.status === 200) {
                setTimeLeft(120);
                setCanResend(false);
                setOtp(['', '', '', '']);
                setError('');
            } else {
                setError(result.response?.data?.message || 'Failed to resend OTP');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setAdminData({ ...adminData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setError('');

        // Move focus to next input
        if (value && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, 4).split('');
        if (pasteData.every(char => /^\d$/.test(char))) {
            const newOtp = [...otp];
            pasteData.forEach((char, i) => {
                if (i < 4) newOtp[i] = char;
            });
            setOtp(newOtp);
            // Focus last filled or next empty
            const lastIndex = Math.min(pasteData.length - 1, 3);
            document.getElementById(`otp-${lastIndex}`)?.focus();
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        const payload = adminData.email ? { email: adminData.email } : { phone: adminData.phone, countryCode: adminData.countryCode };

        if (!otpSent) {
            // Step 1: Send OTP
            if (!adminData.email && !adminData.phone) {
                setError('Please enter your Email or Phone Number');
                return;
            }
            setLoading(true);
            try {
                const result = await adminSendOtpApi(payload);
                if (result.status === 200) {
                    setOtpSent(true);
                } else {
                    setError(result.response?.data?.message || 'Failed to send OTP');
                }
            } catch (err) {
                setError('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        } else {
            // Step 2: Verify OTP
            const otpValue = otp.join('');
            if (otpValue.length < 4) {
                setError('Please enter the complete 4-digit OTP');
                return;
            }
            setLoading(true);
            try {
                const result = await adminVerifyOtpApi({ ...payload, otp: otpValue });
                if (result.status === 200) {
                    const { accessToken, refreshToken, user } = result.data.data;
                    const tokens = {
                        accessToken,
                        refreshToken
                    };
                    login(user, tokens, 'admin');
                    navigate('/admin');
                } else {
                    setError(result.response?.data?.message || 'Invalid OTP');
                }
            } catch (err) {
                setError('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const isFormValid = otpSent
        ? otp.join('').length === 4
        : (adminData.email.trim() !== '' || adminData.phone.trim() !== '');

    return (
        <div className="min-h-screen grid lg:grid-cols-2 font-sans bg-white">
            {/* Left Side - Design element */}
            <div className="hidden lg:flex flex-col justify-center p-12 bg-black relative overflow-hidden h-full">
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-2xl">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className="w-6 h-6 text-black"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-black text-white leading-tight tracking-tighter">
                        Empowering<br />
                        <span className="text-gray-500">Change makers.</span>
                    </h1>
                    <p className="mt-6 text-lg text-gray-400 font-medium max-w-md">
                        Access the control center to manage campaigns, monitor donations, and track impact across the community.
                    </p>
                </div>

                {/* Abstract backgrounds */}
                <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-linear-to-br from-white/20 to-transparent blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-linear-to-tr from-white/10 to-transparent blur-3xl"></div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-10 p-10 bg-gray-100 rounded-3xl">
                    <div className="space-y-2 flex w-full justify-center items-center flex-col ">
                        <div className="lg:hidden w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-xl">
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
                        <h2 className="text-2xl font-black text-black tracking-tight text-center">Admin Portal</h2>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest text-center">
                            {otpSent ? 'Verify Identity' : 'Secure Login'}
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            {!otpSent ? (
                                <>
                                    <div className="space-y-1">
                                        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${adminData.phone ? 'text-gray-300' : 'text-gray-400'}`}>
                                            Email Address
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                <AiOutlineUser className={`h-5 w-5 transition-colors ${adminData.phone ? 'text-gray-300' : 'text-gray-400 group-focus-within:text-black'}`} />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={adminData.email}
                                                onChange={handleChange}
                                                disabled={adminData.phone.length > 0}
                                                className={`block w-full pl-12 pr-5 py-4 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200 text-sm font-semibold text-black ${adminData.phone ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'bg-gray-200'}`}
                                                placeholder="admin@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="text-center text-[15px] font-black text-gray-300">OR</div>

                                    <div className="space-y-1">
                                        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${adminData.email ? 'text-gray-300' : 'text-gray-400'}`}>
                                            Phone Number
                                        </label>
                                        <div className="flex gap-2">
                                            <div className={`relative w-[110px] shrink-0 ${adminData.email.length > 0 ? "opacity-50 pointer-events-none" : ""}`}>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                    className="w-full px-3 py-3 h-[56px] bg-gray-200 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all duration-200 flex items-center justify-between gap-1 cursor-pointer"
                                                >
                                                    <span className="flex items-center gap-2 text-sm font-semibold text-black">
                                                        <img 
                                                            src={COUNTRY_CODES.find(c => c.code === adminData.countryCode)?.flag || COUNTRY_CODES[0].flag} 
                                                            alt="flag" 
                                                            className="w-5 h-auto rounded-[2px] shadow-sm"
                                                        />
                                                        {adminData.countryCode}
                                                    </span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-3 h-3 text-gray-500 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                                
                                                {showCountryDropdown && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setShowCountryDropdown(false)} />
                                                        <div className="absolute top-[60px] left-0 w-[220px] bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                            <div className="max-h-[200px] overflow-y-auto w-full py-2">
                                                                {COUNTRY_CODES.map((country) => (
                                                                    <button
                                                                        key={country.country}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setAdminData({ ...adminData, countryCode: country.code });
                                                                            setShowCountryDropdown(false);
                                                                            setError('');
                                                                        }}
                                                                        className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors ${adminData.countryCode === country.code ? 'bg-gray-50' : ''}`}
                                                                    >
                                                                        <img src={country.flag} alt={country.name} className="w-5 h-auto rounded-[2px] shadow-sm" />
                                                                        <span className="text-sm font-semibold text-black flex-1 text-left">{country.name}</span>
                                                                        <span className="text-xs font-bold text-gray-500">{country.code}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={adminData.phone}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 10) handleChange({ target: { name: 'phone', value: val } });
                                                }}
                                                disabled={adminData.email.length > 0}
                                                className={`block w-full px-5 py-4 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black focus:ring-0 outline-none transition-all duration-200 text-sm font-semibold text-black ${adminData.email ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'bg-gray-200'}`}
                                                placeholder="00000 00000"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            4-Digit Secure Code
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setOtpSent(false)}
                                            className="text-[10px] font-bold text-black border-b border-black hover:border-transparent transition-all uppercase tracking-wider"
                                        >
                                            Change email / phone
                                        </button>
                                    </div>
                                    <div className="flex justify-center gap-4">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                maxLength="1"
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(index, e)}
                                                onPaste={handlePaste}
                                                className={`w-12 h-14 bg-gray-200 border-2 border-transparent rounded-xl text-center text-2xl font-black text-black outline-none transition-all duration-200 focus:bg-white focus:border-black ${digit ? 'border-black bg-white' : ''}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-center">
                                        {canResend ? (
                                            <button
                                                type="button"
                                                onClick={handleResendOtp}
                                                className="text-[10px] font-bold text-black border-b border-black hover:border-transparent transition-all uppercase tracking-widest cursor-pointer"
                                            >
                                                Resend code
                                            </button>
                                        ) : (
                                            <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-widest transition-colors">
                                                Resend code in <span className="text-black font-black ">{formatTime(timeLeft)}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                                <p className="text-xs font-bold text-red-500 uppercase tracking-wider text-center">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !isFormValid}
                            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl transition-all duration-300 shadow-2xl shadow-black/10 active:scale-[0.98] font-black text-sm
                                ${loading || !isFormValid
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed grayscale'
                                    : 'bg-black text-white hover:bg-gray-900 shadow-black/20 transform hover:-translate-y-0.5'
                                }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {otpSent ? 'VERIFY OTP' : 'SEND SECURITY CODE'}
                                    <AiOutlineArrowRight className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-gray-200">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                            &copy; 2026 Yashfi Foundation. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
