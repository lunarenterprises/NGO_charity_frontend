import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import { getUserProfileApi, getUserDonationsApi, getUserFinancialYearTransactionsApi } from '../../Services/userApi';
import { FaEnvelope, FaPhoneAlt, FaCalendarAlt, FaHandsHelping, FaHistory, FaUserEdit, FaDownload, FaFileAlt } from 'react-icons/fa';
import EditProfileModal from '../Components/EditProfileModal';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const handleDownloadStatement = async () => {
        try {
            setDownloading(true);
            const res = await getUserFinancialYearTransactionsApi();
            if (res?.data?.success) {
                const { transactions, fy } = res.data.data;
                if (!transactions || transactions.length === 0) {
                    Swal.fire({
                        icon: 'info',
                        iconColor: '#000',
                        title: 'No Transactions',
                        text: `We couldn't find any transactions for the financial year ${fy}.`,
                        confirmButtonColor: '#000'
                    });
                    return;
                }

                // Initialize PDF
                const doc = new jsPDF();
                const pageWidth = doc.internal.pageSize.width;

                // --- Header Section ---
                // Yashfi Foundation Branding
                doc.setFontSize(22);
                doc.setFont("helvetica", "bold");
                doc.text("Yashfi Foundation", 20, 25);
                
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.text("Empowering Communities, Changing Lives", 20, 32);
                doc.text("Email: info@yashfi.org | Web: yashfi.foundation", 20, 37);

                // Divider
                doc.setDrawColor(0);
                doc.setLineWidth(0.5);
                doc.line(20, 45, pageWidth - 20, 45);

                // Report Title
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("ANNUAL DONATION STATEMENT", 20, 58);
                
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text(`Financial Year: ${fy}`, 20, 65);

                // User Details Box
                doc.setFillColor(250, 250, 250);
                doc.rect(20, 75, pageWidth - 40, 35, 'F');
                doc.setDrawColor(230, 230, 230);
                doc.rect(20, 75, pageWidth - 40, 35, 'S');

                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("DONOR DETAILS", 25, 83);
                
                doc.setFont("helvetica", "normal");
                doc.text(`Full Name: ${profileData.fullname}`, 25, 90);
                doc.text(`Email Address: ${profileData.email}`, 25, 96);
                doc.text(`Mobile: ${profileData.phone || "N/A"}`, 25, 102);
                doc.text(`Member Since: ${profileData.joinedDate}`, pageWidth / 2 + 10, 90);
                doc.text(`Statement Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2 + 10, 96);

                // --- Table Section ---
                const tableHeaders = [["Date", "Project / Initiative", "Transaction ID", "Status", "Amount (INR)"]];
                const tableRows = transactions.map(t => [
                    new Date(t.date).toLocaleDateString('en-IN'),
                    t.project,
                    t.paymentId || t.id,
                    t.status,
                    Number(t.amount).toLocaleString('en-IN')
                ]);

                autoTable(doc, {
                    head: tableHeaders,
                    body: tableRows,
                    startY: 120,
                    margin: { left: 20, right: 20 },
                    styles: { fontSize: 9, cellPadding: 4 },
                    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
                    alternateRowStyles: { fillColor: [245, 245, 245] },
                    columnStyles: {
                        4: { halign: 'right', fontStyle: 'bold' }
                    }
                });

                // --- Footer Section ---
                const finalY = doc.lastAutoTable.finalY + 15;
                const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text(`Total Contribution in FY ${fy}: INR ${totalAmount.toLocaleString('en-IN')}/-`, pageWidth - 20, finalY, { align: 'right' });

                // Signature/Note
                doc.setFontSize(9);
                doc.setFont("helvetica", "italic");
                doc.text("This is a computer-generated statement and does not require a physical signature.", 20, finalY + 25);
                doc.text("For any queries, please contact us at info@yashfi.org", 20, finalY + 30);

                // Save PDF
                doc.save(`Donation_Statement_${fy}_${user.fullname.replace(/\s+/g, '_')}.pdf`);

                Swal.fire({
                    icon: 'success',
                    iconColor: '#000',
                    title: 'Download Started',
                    text: 'Your tax statement PDF is being downloaded.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            console.error("Profile: Download Error Detailed", err);
            Swal.fire({
                icon: 'error',
                iconColor: '#000',
                title: 'Download Failed',
                text: 'An error occurred while generating your statement. Please try again later.',
                confirmButtonColor: '#000'
            });
        } finally {
            setDownloading(false);
        }
    };

    const fetchUserData = useCallback(async () => {
        try {
            const [profileRes, donationsRes] = await Promise.all([
                getUserProfileApi(),
                getUserDonationsApi({ page: 1, limit: 6 })
            ]);

            if (profileRes?.data?.success) {
                const userData = profileRes.data.data;

                // Sync AuthContext if necessary
                if (userData.fullname !== user?.fullname || userData.phone !== user?.phone) {
                    updateUser(userData);
                }

                let processedDonations = [];
                if (donationsRes?.data?.success && donationsRes?.data?.data) {
                    processedDonations = donationsRes.data.data.slice(0, 6).map(donation => {
                        const isMonthly = donation.isMonthly || donation.type === 'monthly';
                        const projectData = donation.Project || donation.project;

                        let projectName = "General Fund";
                        if (typeof projectData === 'string') {
                            projectName = projectData;
                        } else if (projectData) {
                            projectName = projectData.name || projectData.title || "General Fund";
                        }

                        return {
                            id: donation.id || donation._id,
                            project: projectName,
                            amount: `₹${Number(donation.amount || 0).toLocaleString('en-IN')}`,
                            date: new Date(donation.createdAt || donation.date).toLocaleDateString('en-US', {
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
                <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100 mb-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full -mr-32 -mt-32 blur-3xl text-gray"></div>
                    <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
                        {/* Avatar */}
                        <div className="w-24 h-24 sm:w-30 sm:h-30  rounded-[30px] bg-black flex items-center justify-center text-white sm:text-5xl text-4xl font-bold shadow-2xl shadow-black/20 transform hover:scale-105 transition-transform duration-500 shrink-0">
                            {profileData.fullname.charAt(0).toUpperCase()}
                        </div>

                        {/* User Info */}
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">{profileData.fullname}</h1>

                            <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-3 md:gap-6 mb-6 text-gray-500 font-bold">
                                <p className="text-sm flex items-center justify-center md:justify-start gap-2 leading-none">
                                    <FaEnvelope className="w-3.5 h-3.5 text-gray-400" />
                                    {profileData.email}
                                </p>
                                <div className="hidden md:block w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                                <p className="text-sm flex items-center justify-center md:justify-start gap-2 leading-none">
                                    <FaPhoneAlt className="w-3.5 h-3.5 text-gray-400" />
                                    {profileData.phone || "No phone"}
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className="px-5 py-2 bg-green-50 text-green-600 text-[11px] font-black uppercase tracking-wider rounded-full border border-green-100 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                    Active Member
                                </span>
                                <span className="px-5 py-2 bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-wider rounded-full border border-blue-100 flex items-center gap-2 shadow-sm">
                                    <FaCalendarAlt className="w-3 h-3" />
                                    Joined {profileData.joinedDate}
                                </span>
                            </div>

                            {/* Mobile Edit Button */}
                            <div className="mt-8 md:hidden flex justify-center">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="px-10 py-3.5 bg-black text-white text-sm font-black rounded-2xl hover:bg-gray-800 transition-all flex items-center gap-3 active:scale-95"
                                >
                                    <FaUserEdit className="w-4 h-4" />
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* Desktop Edit Button */}
                        <div className="hidden md:flex flex-col items-end gap-2">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="px-8 py-3 bg-black text-white text-sm font-black rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-3"
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
                                {profileData.isMonthlyDonor ? "Monthly Donoation  " : "Be a Monthly Donor"}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
                                {profileData.isMonthlyDonor
                                    ? "Thank you for being a part of our monthly donor program. Your consistent support makes a real difference in people's lives."
                                    : "Join our community of monthly donors and create a lasting impact. Your consistent support helps us plan ahead and reach more people in need."}
                            </p>
                            <button onClick={() => navigate('/monthly-donation')} className="w-full py-3 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/5 flex items-center justify-center gap-2 group">
                                {profileData.isMonthlyDonor ? "Manage My Donation" : "Join the Promise"}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-black rounded-3xl p-6 shadow-xl shadow-black/10 text-white relative overflow-hidden mb-6">
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

                        {/* Statement Download Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaFileAlt className="w-4 h-4 text-gray-400" />
                                    Tax Statement
                                </h3>
                                <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
                                    Download your consolidated donation statement for the last financial year for your records.
                                </p>
                            </div>
                            <button 
                                onClick={handleDownloadStatement} 
                                disabled={downloading}
                                className="w-full py-3 bg-gray-100 text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 active:scale-95"
                            >
                                {downloading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        Preparing...
                                    </>
                                ) : (
                                    <>
                                        Download Statement
                                        <FaDownload className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: History */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FaHistory className="w-4 h-4 text-gray-400" />
                                Recent Transactions
                            </h3>
                            <div className="space-y-2">
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
                onNoChanges={() => setIsEditModalOpen(true)}
                userData={profileData}
                onUpdateSuccess={handleUpdateSuccess}
            />
        </div>
    );
};

export default Profile;
