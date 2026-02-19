import React from 'react';
import { Link } from 'react-router-dom';
import {
    HiOutlineHeart,
    HiOutlineCash,
    HiOutlineUserGroup,
    HiOutlineTrendingUp
} from 'react-icons/hi';

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
    const stats = [
        { title: 'Total Projects', value: '12', icon: <HiOutlineHeart /> },
        { title: 'Total Donations', value: '$45,230', icon: <HiOutlineCash /> },
        { title: 'Active Donors', value: '1,284', icon: <HiOutlineUserGroup /> },
        { title: 'Goal Reach Rate', value: '84%', icon: <HiOutlineTrendingUp /> },
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white p-6 border shadow-sm border-gray-100 rounded-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-black uppercase tracking-tight">Recent Projects</h3>
                        <Link to="/admin/active-projects" className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-widest">View All</Link>
                    </div>
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white border border-gray-200 rounded flex items-center justify-center font-bold text-xs">P{i}</div>
                                    <div>
                                        <h4 className="text-sm font-bold text-black">Clean Water Initiative #{i}</h4>
                                        <p className="text-[10px] text-gray-400 uppercase font-medium">Updated 2h ago</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-black">$2,400</p>
                                    <p className="text-[10px] text-teal-600 font-bold uppercase">Active</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Donations */}
                <div className="bg-white p-6 border border-gray-100 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold text-black uppercase tracking-tight">Recent Donations</h3>
                        <button className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest">History</button>
                    </div>
                    <div className="">
                        {[
                            { name: 'Arjun Das', email: 'arjun@example.com', project: 'Clean Water', amount: '$50' },
                            { name: 'Meera K', email: 'meera@web.in', project: 'Quick', amount: '$120' },
                            { name: 'Rahul S', email: 'rahul.s@gmail.com', project: 'Education Aid', amount: '$200' },
                            { name: 'Sarah J', email: 'sarah.j@outlook.com', project: 'Quick', amount: '$45' }
                        ].map((donation, idx) => (
                            <div key={idx} className="flex flex-col gap-0.5 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-bold text-black">{donation.name}</h4>
                                    <span className="text-xs font-bold text-black">{donation.amount}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-medium">{donation.email}</p>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${donation.project === 'Quick' ? 'bg-gray-100 text-gray-600' : 'bg-black text-white'
                                        }`}>
                                        {donation.project}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3 bg-black text-white text-[10px] font-bold rounded uppercase tracking-widest hover:bg-gray-800 transition-colors">
                        View All Donations
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
