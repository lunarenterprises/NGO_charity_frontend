import React from 'react';
import { HiOutlineArrowLeft, HiOutlineSearch, HiOutlineDownload } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const RecentTransactions = () => {
    // Mock data for transactions
    const transactions = [
        { id: 'TXN001', name: "Ananya Sharma", type: "Clean Water Project", email: "ananya.s@example.com", phone: "+91 98765 43210", date: "Feb 15, 2026", amount: "₹25,000" },
        { id: 'TXN002', name: "Rahul Verma", type: "Quick Donation", email: "rahul.v@example.com", phone: "+91 87654 32109", date: "Feb 14, 2026", amount: "₹10,000" },
        { id: 'TXN003', name: "Priya Patel", type: "Education Aid", email: "priya.p@example.com", phone: "+91 76543 21098", date: "Feb 12, 2026", amount: "₹50,000" },
        { id: 'TXN004', name: "Amit Singh", type: "Quick Donation", email: "amit.s@example.com", phone: "+91 65432 10987", date: "Feb 10, 2026", amount: "₹15,000" },
        { id: 'TXN005', name: "Sneha Reddy", type: "Healthcare Initiative", email: "sneha.r@example.com", phone: "+91 54321 09876", date: "Feb 08, 2026", amount: "₹5,000" },
        { id: 'TXN006', name: "Vikram Malhotra", type: "Quick Donation", email: "vikram.m@example.com", phone: "+91 43210 98765", date: "Feb 05, 2026", amount: "₹12,000" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-['Poppins']">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-8">
                <div className="flex items-center gap-4">
                    <Link
                        to="/admin"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black"
                    >
                        <HiOutlineArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-black tracking-tight">Recent Transactions</h1>
                        <p className="text-sm text-gray-500">Comprehensive log of all NGO contributions.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 text-black text-[10px] font-black uppercase tracking-widest rounded hover:border-black hover:bg-gray-50 transition-all shadow-sm">
                        <HiOutlineDownload className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96 group">
                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search donors, emails, or transactions..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-black transition-all shadow-sm"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['All', 'Quick Donation', 'Project Specific'].map((filter) => (
                        <button key={filter} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${filter === 'All' ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-black hover:text-black'}`}>
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transactions Table Section */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 bg-black flex justify-between items-center">
                    <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-white">Transaction History</h2>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{transactions.length} Records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Donor Name</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Donation Type</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Contact Info</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black text-center">Date</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((txn) => (
                                <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <p className="text-sm font-bold text-black group-hover:underline transition-all underline-offset-4 decoration-gray-300">{txn.name}</p>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase">ID: {txn.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-2 rounded text-[9px] font-semibold uppercase tracking-tighter ${txn.type === 'Quick Donation' ? 'bg-gray-200 text-gray-500' : 'bg-black text-white'}`}>
                                            {txn.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm text-black font-semibold tracking-tight">{txn.email}</p>
                                            <p className="text-[13px] text-gray-400 font-medium">{txn.phone}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500 font-medium text-center">{txn.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-black text-black bg-gray-100 px-3 py-1 rounded-md">{txn.amount}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RecentTransactions;
