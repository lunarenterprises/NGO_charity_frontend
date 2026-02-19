import React, { useState } from 'react';
import { HiOutlineArrowLeft, HiOutlineSearch, HiOutlineEye, HiX, HiOutlineCash } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const Users = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock data for users
    const users = [
        { id: 1, username: "Ananya Sharma", email: "ananya.s@example.com", phone: "+91 98765 43210" },
        { id: 2, username: "Rahul Verma", email: "rahul.v@example.com", phone: "+91 87654 32109" },
        { id: 3, username: "Priya Patel", email: "priya.p@example.com", phone: "+91 76543 21098" },
        { id: 4, username: "Amit Singh", email: "amit.s@example.com", phone: "+91 65432 10987" },
        { id: 5, username: "Sneha Reddy", email: "sneha.r@example.com", phone: "+91 54321 09876" },
    ];

    // Mock data for user transactions
    const userTransactions = {
        1: [
            { id: 'TXN001', type: "Clean Water Project", date: "Feb 15, 2026", amount: "₹25,000" },
            { id: 'TXN008', type: "Quick Donation", date: "Jan 20, 2026", amount: "₹5,000" },
        ],
        2: [
            { id: 'TXN002', type: "Quick Donation", date: "Feb 14, 2026", amount: "₹10,000" },
        ],
        3: [
            { id: 'TXN003', type: "Education Aid", date: "Feb 12, 2026", amount: "₹50,000" },
            { id: 'TXN012', type: "Medical Camp", date: "Dec 15, 2025", amount: "₹15,000" },
        ],
        4: [
            { id: 'TXN004', type: "Quick Donation", date: "Feb 10, 2026", amount: "₹15,000" },
        ],
        5: [
            { id: 'TXN005', type: "Healthcare Initiative", date: "Feb 08, 2026", amount: "₹5,000" },
        ],
    };

    const handleViewTransactions = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

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
                        <h1 className="text-2xl font-bold text-black tracking-tight">User Management</h1>
                        <p className="text-sm text-gray-500">Manage and view donation history for all registered users.</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-96 group">
                <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-black transition-all shadow-sm"
                />
            </div>

            {/* Users Table Section */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 bg-black flex justify-between items-center">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Registered Users</h2>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{users.length} Total Users</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Username</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Email</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Phone</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-black">{user.username}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 font-medium">{user.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 font-medium">{user.phone}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleViewTransactions(user)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-gray-800 transition-all shadow-sm"
                                        >
                                            <HiOutlineEye className="w-4 h-4" />
                                            View History
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* TRANSACTIONS MODAL - NEW PREMIUM DESIGN */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        onClick={() => setIsModalOpen(false)}
                    ></div>
                    <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
                        {/* Modal Header/Profile Summary */}
                        <div className="p-8 bg-gray-800 text-white relative">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <HiX className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-6">
                                
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold tracking-tight">{selectedUser.username}</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedUser.email}</p>
                                    <div className="flex gap-4 pt-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-gray-500">Total Donated</span>
                                            <span className="text-lg font-black text-white">
                                                ₹{(userTransactions[selectedUser.id] || []).reduce((acc, curr) => acc + parseInt(curr.amount.replace(/[₹,]/g, '')), 0).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-400 self-end"></div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-gray-500">Impact Count</span>
                                            <span className="text-lg font-black text-white">{(userTransactions[selectedUser.id] || []).length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content - Activity Timeline */}
                        <div className="p-8 bg-white">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Contribution Timeline</h3>
                            <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                                {(userTransactions[selectedUser.id] || []).map((txn, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center font-black text-black text-xs group-hover:bg-black group-hover:text-white transition-colors">
                                                <HiOutlineCash className="w-4 h-4" />
                                            </div>
                                            {idx !== (userTransactions[selectedUser.id].length - 1) && (
                                                <div className="w-px h-full bg-gray-100 mt-2"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-sm font-bold text-black">{txn.type}</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest">{txn.date}</p>
                                                </div>
                                                <span className="text-sm font-black text-black bg-gray-50 px-3 py-1 rounded-md border border-gray-100">{txn.amount}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Transaction Ref: {txn.id}</p>
                                        </div>
                                    </div>
                                ))}

                                {(!userTransactions[selectedUser.id] || userTransactions[selectedUser.id].length === 0) && (
                                    <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic px-6">
                                            This user hasn't made any recorded contributions yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
