import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { FaUser, FaPhone, FaEnvelope, FaChevronDown } from 'react-icons/fa';
import { updateUserProfileApi } from '../../Services/userApi';
import { showAlert } from '../../Utils/alert';
import { COUNTRY_CODES } from '../../Constants/countryCodes';

const EditProfileModal = ({ isOpen, onClose, userData, onUpdateSuccess, onNoChanges }) => {
    const portalRoot = document.body;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [formData, setFormData] = useState({
        fullname: '',
        phone: '',
        email: '',
        countryCode: '+91'
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                fullname: userData.fullname || '',
                phone: userData.phone || '',
                email: userData.email || '',
                countryCode: userData.countryCode || '+91'
            });
        }
    }, [userData, isOpen]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Change Detection
        const initialFullname = userData.fullname || '';
        const initialPhone = userData.phone || '';
        const initialEmail = userData.email || '';
        const initialCountryCode = userData.countryCode || '+91';

        const hasChanges = 
            formData.fullname.trim() !== initialFullname ||
            formData.phone.trim() !== initialPhone ||
            formData.email.trim() !== initialEmail ||
            formData.countryCode !== initialCountryCode;

        if (!hasChanges) {
            onClose();
            await showAlert("No Changes Found", "No changes detected. Please update for saving new changes.", "info");
            setLoading(false);
            onNoChanges?.();
            return;
        }

        try {
            // We only send fullname and phone as per standard profile updates
            const updatePayload = {
                fullname: formData.fullname,
                phone: formData.phone,
                email: formData.email,
                countryCode: formData.countryCode
            };

            const response = await updateUserProfileApi(updatePayload);

            if (response?.data?.success) {
                setError(''); // Clear any previous errors
                showAlert("Success!", "Profile updated successfully", "success");
                
                // Use a separate try-catch for success callbacks to prevent them from triggering the main error UI
                try {
                    onUpdateSuccess(response.data.data);
                    onClose();
                } catch (callbackErr) {
                    console.error("EditProfileModal: Success Callback Error", callbackErr);
                }
            } else {
                setError(response?.response?.data?.message || "Failed to update profile");
            }
        } catch (err) {
            console.error("EditProfileModal: API Error", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-100 grid place-items-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all"
                >
                    <IoClose className="w-6 h-6" />
                </button>

                <div className="p-8 md:p-10">
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 mb-4 bg-black rounded-2xl shadow-lg shadow-black/10 text-white">
                            <FaUser className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">Update your personal information</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                    className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all font-semibold text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Phone Number
                            </label>
                            <div className="flex gap-2">
                                <div className="relative w-[110px] shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                        className="w-full px-3 py-4 h-[54px] bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-black outline-none transition-all flex items-center justify-between gap-1 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            <img 
                                                src={COUNTRY_CODES.find(c => c.code === formData.countryCode)?.flag || COUNTRY_CODES[0].flag} 
                                                alt="flag" 
                                                className="w-5 h-auto rounded-[2px] shadow-sm"
                                            />
                                            <span className="text-sm font-semibold text-black">
                                                {formData.countryCode}
                                            </span>
                                        </div>
                                        <FaChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
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
                                                                setFormData({ ...formData, countryCode: country.code });
                                                                setShowCountryDropdown(false);
                                                                setError('');
                                                            }}
                                                            className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors ${formData.countryCode === country.code ? 'bg-gray-50' : ''}`}
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
                                <div className="relative flex-1">
                                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                        className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all font-semibold text-sm"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                    className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all font-semibold text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">{error}</p>
                            </div>
                        )}

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 bg-gray-100 text-gray-600 text-sm font-bold rounded-2xl hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-2 py-4 bg-black text-white text-sm font-bold rounded-2xl hover:bg-gray-900 transition-all shadow-xl shadow-black/10 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Saving Changes...</span>
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* Background overlay click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );

    return ReactDOM.createPortal(modalContent, portalRoot);
};

export default EditProfileModal;
