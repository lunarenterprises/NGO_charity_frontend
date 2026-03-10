import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    HiOutlineHeart,
    HiOutlineCash,
    HiOutlineUserGroup,
    HiOutlineTrendingUp,
    HiOutlineLightningBolt,
    HiOutlineUserAdd
} from 'react-icons/hi';
import { getAllDonationsApi, getDashboardStatsApi, getActiveProjectsApi } from '../../Services/adminApi';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 border border-gray-100 rounded-lg shadow-sm hover:border-black transition-all group">
        <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded bg-gray-50 text-black group-hover:bg-black group-hover:text-white transition-colors">
                {React.cloneElement(icon, { className: "w-5 h-5" })}
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">+12%</span>
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-black">{value}</h3>
    </div>
);

const AdminDashboard = () => {
    const [recentDonations, setRecentDonations] = useState([]);
    const [loadingDonations, setLoadingDonations] = useState(true);

    // Dashboard Stats State
    const [dashboardStats, setDashboardStats] = useState(null);
    const [activeProjectsCount, setActiveProjectsCount] = useState(0);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        fetchRecentDonations();
        fetchDashboardStats();
    }, []);

    const fetchRecentDonations = async () => {
        try {
            setLoadingDonations(true);
            const result = await getAllDonationsApi({ page: 1, limit: 4 });

            if (result.status === 200 && result.data) {
                const responseData = result.data;
                if (responseData.success || responseData.result) {
                    setRecentDonations(responseData.data || []);
                }
            } else {
                const status = result.response?.status || result.status;
                if (status === 401) {
                    setTimeout(() => fetchRecentDonations(), 1000);
                }
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setTimeout(() => fetchRecentDonations(), 1000);
            }
            console.error("Error fetching recent donations:", err);
        } finally {
            setLoadingDonations(false);
        }
    };
    const fetchDashboardStats = async () => {
        try {
            setLoadingStats(true);
            const [statsResult, projectsResult] = await Promise.all([
                getDashboardStatsApi(),
                getActiveProjectsApi({ page: 1, limit: 1 })
            ]);

            if (statsResult.status === 200 && statsResult.data && statsResult.data.data) {
                setDashboardStats(statsResult.data.data);
            } else if (statsResult.response?.status === 401) {
                setTimeout(() => fetchDashboardStats(), 1000);
                return;
            }

            if (projectsResult.status === 200 && projectsResult.data) {
                const pData = projectsResult.data;
                const count = pData.meta?.total || pData.pagination?.total || pData.data?.length || pData.projects?.length || 0;
                setActiveProjectsCount(count);
            }

        } catch (err) {
            if (err.response?.status === 401) {
                setTimeout(() => fetchDashboardStats(), 1000);
            }
            console.error("Error fetching dashboard stats:", err);
        } finally {
            setLoadingStats(false);
        }
    };

    const stats = [
        { title: 'Active Projects', value: dashboardStats?.activeProjects || dashboardStats?.totalActiveProjects || activeProjectsCount.toString(), icon: <HiOutlineHeart /> },
        { title: 'Donations Today', value: `₹${(dashboardStats?.todaysTotalDonations || 0).toLocaleString('en-IN')}`, icon: <HiOutlineCash /> },
        { title: 'Quick Donations Today', value: `₹${(dashboardStats?.totalQuickDonationsToday || 0).toLocaleString('en-IN')}`, icon: <HiOutlineLightningBolt /> },
        { title: 'Project Donations Today', value: `₹${(dashboardStats?.totalProjectDonations || 0).toLocaleString('en-IN')}`, icon: <HiOutlineTrendingUp /> },
    ];

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col gap-2 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-black tracking-tight">Dashboard Overview</h1>
                <p className="text-sm text-gray-500">Manage your NGO activities and monitor impact.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* New Stat Cards Row */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-max">
                        <StatCard
                            title="Registered Users"
                            value={loadingStats ? "..." : (dashboardStats?.totalUsers || 0).toLocaleString()}
                            icon={<HiOutlineUserGroup />}
                        />
                        <StatCard
                            title="New Users Today"
                            value={loadingStats ? "..." : (dashboardStats?.newUsersToday || 0).toLocaleString()}
                            icon={<HiOutlineUserAdd />}
                        />
                    </div>
                </div>

                {/* Recent Donations */}
                <div className="lg:col-span-2 bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold text-black uppercase tracking-tight">Recent Donations</h3>
                        <Link to="/admin/recent-transactions" className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest">History</Link>
                    </div>

                    {loadingDonations ? (
                        <div className="flex flex-col items-center py-10">
                            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading...</p>
                        </div>
                    ) : recentDonations.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">No recent donations</p>
                        </div>
                    ) : (
                        <div className="">
                            {recentDonations.map((donation, idx) => {
                                const projectName = donation.Project ? (donation.Project.name || donation.Project.title) : (donation.project ? (donation.project.name || donation.project.title) : 'Quick');
                                const donorName = donation.donorName || donation.name || donation.User?.fullname || donation.user?.fullname || 'Anonymous';
                                const donorEmail = donation.donorEmail || donation.email || donation.User?.email || donation.user?.email || 'N/A';

                                return (
                                    <div key={donation.id || donation._id || idx} className="flex flex-col gap-0.5 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold text-black">{donorName}</h4>
                                            <span className="text-xs font-bold text-black">₹{Number(donation.amount || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-medium">{donorEmail}</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${(!donation.Project && !donation.project) ? 'bg-gray-100 text-gray-600' : 'bg-black text-white'}`}>
                                                {projectName}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <Link to="/admin/recent-transactions">
                        <button className="w-full mt-6 py-3 bg-black text-white text-[10px] font-bold rounded uppercase tracking-widest hover:bg-gray-800 transition-colors">
                            View All Donations
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
