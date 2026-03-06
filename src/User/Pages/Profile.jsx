import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import { getUserProfileApi, getUserDonationsApi } from '../../Services/userApi';
import { FaEnvelope, FaPhone, FaCalendarAlt, FaHandsHelping, FaHistory, FaUserEdit } from 'react-icons/fa';
import EditProfileModal from '../Components/EditProfileModal';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchUserData = useCallback(async () => {
        try {
            const [profileRes, donationsRes] = await Promise.all([
                getUserProfileApi(),
                getUserDonationsApi({ page: 1, limit: 3 })
            ]);

            if (profileRes?.data?.success) {
                const userData = profileRes.data.data;

                // Sync AuthContext if necessary
                if (userData.fullname !== user?.fullname || userData.phone !== user?.phone) {
                    updateUser(userData);
                }

                let processedDonations = [];
                if (donationsRes?.data?.success && donationsRes?.data?.data) {
                    processedDonations = donationsRes.data.data.slice(0, 3).map(donation => {
                        const projectData = donation.Project || donation.project;
                        return {
                            id: donation.id || donation._id,
                            project: projectData ? (projectData.name || projectData.title) : "General Fund",
                            amount: `₹${Number(donation.amount || 0).toLocaleString('en-IN')}`,
                            date: new Date(donation.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            }),
                            status: donation.paymentStatus || donation.status || 'Confirmed'
                        };
                    });
                }

                setProfileData({
                    ...userData,
                    joinedDate: new Date(userData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    formattedTotalDonations: `₹${Number(userData.totalDonation || 0).toLocaleString('en-IN')}`,
                    recentDonations: processedDonations
                });
            } else {
                setError("Failed to fetch profile details");
            }
        } catch (err) {
            console.error("Profile: API Error", err);
            setError("An error occurred while fetching your data");
        } finally {
            setLoading(false);
        }
    }, [user, updateUser]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const handleUpdateSuccess = (updatedUser) => {
        updateUser(updatedUser);
        fetchUserData();
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center bg-gray-50">
                <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-bold animate-pulse text-sm">Validating your profile...</p>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center bg-gray-50">
                <div className="w-16 h-16 flex items-center justify-center text-red-500 mb-4 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
                    <FaHistory className="w-8 h-8" />
                </div>
                <p className="text-gray-900 font-bold mb-2">{error || "User data not found"}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-gray-50 px-6 md:px-12">
            <div className="max-w-4xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative flex flex-col md:flex-row items-center gap-8">
                        <div className="w-32 h-32 rounded-3xl bg-black flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-black/20 transform hover:scale-105 transition-transform duration-500">
                            {profileData.fullname.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">{profileData.fullname}</h1>
                            <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-1 md:gap-4 mb-4 text-gray-500 font-bold">
                                <p className="text-sm flex items-center justify-center md:justify-start gap-1.5 leading-none">
                                    <FaEnvelope className="w-3 h-3 text-gray-400" />
                                    {profileData.email}
                                </p>
                                <div className="hidden md:block w-1 h-1 bg-gray-300 rounded-full"></div>
                                <p className="text-sm flex items-center justify-center md:justify-start gap-1.5 leading-none">
                                    <FaPhone className="w-3 h-3 text-gray-400" />
                                    {profileData.phone || "No phone"}
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className="px-4 py-1.5 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                    Active Member
                                </span>
                                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100 flex items-center gap-2">
                                    <FaCalendarAlt className="w-3 h-3" />
                                    Joined {profileData.joinedDate}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-2">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/10 flex items-center gap-2"
                            >
                                <FaUserEdit className="w-4 h-4" />
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaHandsHelping className="w-4 h-4 text-gray-400" />
                                Be a Monthly Donor
                            </h3>
                            <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
                                Join our community of monthly donors and create a lasting impact. Your consistent support helps us plan ahead and reach more people in need.
                            </p>
                            <button className="w-full py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/5 flex items-center justify-center gap-2 group">
                                Join the Promise
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-black rounded-3xl p-6 shadow-xl shadow-black/10 text-white relative overflow-hidden">
                            <FaHandsHelping className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <FaHandsHelping className="w-4 h-4" />
                                Impact Summary
                            </h3>
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/60">Total Donated</p>
                                    <p className="text-2xl font-bold">{profileData.formattedTotalDonations}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: History */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FaHistory className="w-4 h-4 text-gray-400" />
                                Recent Activity
                            </h3>
                            <div className="space-y-4">
                                {profileData.recentDonations.length > 0 ? (
                                    profileData.recentDonations.map((donation) => (
                                        <div key={donation.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all">
                                                    <FaHandsHelping className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{donation.project}</p>
                                                    <p className="text-[11px] font-medium text-gray-400">{donation.date}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-black">{donation.amount}</p>
                                                <p className={`text-[10px] font-bold uppercase ${donation.status?.toLowerCase() === 'success' || donation.status?.toLowerCase() === 'confirmed' ? 'text-green-500' : 'text-blue-500'}`}>
                                                    {donation.status}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-200 mb-3">
                                            <FaHistory className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-400 italic">No recent transactions found</p>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => navigate('/transactions')} className="w-full mt-6 py-3 border-2 border-dashed border-gray-400 rounded-2xl text-gray-400 text-xs font-bold hover:bg-gray-50 hover:border-gray-200 hover:text-gray-600 transition-all uppercase tracking-widest">
                                View Full History
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                userData={profileData}
                onUpdateSuccess={handleUpdateSuccess}
            />
        </div>
    );
};

export default Profile;
