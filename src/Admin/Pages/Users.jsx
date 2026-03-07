import React, { useState, useEffect } from 'react';
import { HiOutlineArrowLeft, HiOutlineSearch, HiOutlineEye, HiX, HiOutlineCash, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { getAllUsersApi, getUserDonationsAdminApi } from '../../Services/adminApi';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // User Transactions State
    const [userTransactions, setUserTransactions] = useState([]);
    const [loadingTxns, setLoadingTxns] = useState(false);
    const [txnPage, setTxnPage] = useState(1);
    const [txnTotalPages, setTxnTotalPages] = useState(1);
    const [txnTotalRecords, setTxnTotalRecords] = useState(0);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchUsers();
    }, [debouncedSearch, currentPage]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearch
            };
            const result = await getAllUsersApi(params);

            // If the interceptor is handling a token refresh, result might be the retried response
            if (result.status === 200) {
                // Adjust based on the expected response structure
                const responseData = result.data.data || result.data;

                if (responseData && responseData.users) {
                    setUsers(responseData.users);
                    setTotalPages(responseData.totalPages || 1);
                } else if (Array.isArray(responseData)) {
                    setUsers(responseData);
                    setTotalPages(1);
                } else {
                    setUsers([]);
                }
            } else {
                // Don't treat 401 as a page-level error — the interceptor handles token refresh
                const status = result.response?.status || result.status;
                if (status === 401) {
                    // Token refresh is being handled by the interceptor, just retry after a short delay
                    setTimeout(() => fetchUsers(), 1000);
                    return;
                }
                setError(result.response?.data?.message || "Failed to fetch users");
            }
        } catch (err) {
            // Don't treat 401 as a fatal error — the interceptor will handle refresh
            if (err.response?.status === 401) {
                setTimeout(() => fetchUsers(), 1000);
                return;
            }
            setError("Something went wrong while fetching users");
        } finally {
            setLoading(false);
        }
    };

    // Fetch User Transactions when modal is open
    useEffect(() => {
        if (isModalOpen && selectedUser) {
            fetchUserTransactions();
        }
    }, [isModalOpen, selectedUser, txnPage]);

    const fetchUserTransactions = async () => {
        setLoadingTxns(true);
        try {
            const userId = selectedUser._id || selectedUser.id;
            const result = await getUserDonationsAdminApi(userId, { page: txnPage, limit: 10 });

            if (result.status === 200 && result.data) {
                const responseData = result.data;
                if (responseData.success || responseData.result) {
                    const data = responseData.data || [];
                    setUserTransactions(data);

                    if (responseData.meta) {
                        setTxnTotalPages(responseData.meta.totalPages || 1);
                        setTxnTotalRecords(responseData.meta.total || data.length);
                    } else if (responseData.pagination) {
                        setTxnTotalPages(responseData.pagination.totalPages || 1);
                        setTxnTotalRecords(responseData.pagination.total || data.length);
                    } else {
                        setTxnTotalPages(data.length < 10 ? txnPage : txnPage + 1);
                        setTxnTotalRecords(data.length);
                    }
                } else {
                    setUserTransactions([]);
                }
            } else {
                const status = result.response?.status || result.status;
                if (status === 401) {
                    setTimeout(() => fetchUserTransactions(), 1000);
                }
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setTimeout(() => fetchUserTransactions(), 1000);
            }
            console.error('Fetch user transactions error:', err);
        } finally {
            setLoadingTxns(false);
        }
    };

    const handleViewTransactions = (user) => {
        setSelectedUser(user);
        setTxnPage(1); // Reset page on open
        setUserTransactions([]); // Clear previous to show loading state
        setTxnTotalRecords(0);
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users by name, email or phone..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-black transition-all shadow-sm"
                />
            </div>

            {/* Users Table Section */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm min-h-[400px]">
                <div className="p-6 border-b border-gray-100 bg-black flex justify-between items-center">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Registered Users</h2>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{users.length} Total Users</span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-black uppercase tracking-widest">Loading Users...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4 text-center">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-black uppercase tracking-widest">Unable to load data</p>
                            <p className="text-xs text-gray-500 mt-1">{error}</p>
                        </div>
                        <button
                            onClick={fetchUsers}
                            className="px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-gray-900 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center">
                            <HiOutlineSearch className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-black uppercase tracking-widest">No users found</p>
                    </div>
                ) : (
                    <>
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
                                        <tr key={user._id || user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-black">{user.fullname || user.username}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600 font-medium">{user.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600 font-medium">{user.phone || 'N/A'}</p>
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

                        {/* Pagination Controls */}
                        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                Page <span className="text-black">{currentPage}</span> of <span className="text-black">{totalPages}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                >
                                    <HiOutlineChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                >
                                    <HiOutlineChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
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
                                    <h2 className="text-2xl font-bold tracking-tight">{selectedUser.fullname || selectedUser.username}</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedUser.email}</p>
                                    <div className="flex gap-4 pt-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-gray-500">Total Donated</span>
                                            <span className="text-lg font-black text-white">
                                                ₹{userTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-400 self-end"></div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-gray-500">Impact Count</span>
                                            <span className="text-lg font-black text-white">{txnTotalRecords || userTransactions.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content - Activity Timeline */}
                        <div className="p-8 bg-white flex flex-col max-h-[60vh]">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Contribution Timeline</h3>

                            {loadingTxns ? (
                                <div className="flex flex-col items-center justify-center p-10 space-y-4">
                                    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading...</p>
                                </div>
                            ) : userTransactions.length === 0 ? (
                                <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic px-6">
                                        This user hasn't made any recorded contributions yet.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar flex-1 mb-4">
                                        {userTransactions.map((txn, idx) => {
                                            const projectName = txn.Project ? (txn.Project.name || txn.Project.title) : (txn.project ? (txn.project.name || txn.project.title) : 'General Donation');
                                            const date = txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
                                            const amount = Number(txn.amount || 0).toLocaleString('en-IN');
                                            const txnId = (txn.razorpayPaymentId || txn.paymentId || txn._id || txn.id)?.toString().substring(0, 15);

                                            return (
                                                <div key={txn._id || txn.id || idx} className="flex gap-4 group">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center font-black text-black text-xs group-hover:bg-black group-hover:text-white transition-colors">
                                                            <HiOutlineCash className="w-4 h-4" />
                                                        </div>
                                                        {idx !== (userTransactions.length - 1) && (
                                                            <div className="w-px h-full bg-gray-100 mt-2"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pb-6">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="text-sm font-bold text-black">{projectName}</h4>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest">{date}</p>
                                                            </div>
                                                            <span className="text-sm font-black text-black bg-gray-50 px-3 py-1 rounded-md border border-gray-100">₹{amount}</span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Transaction Ref: {txnId}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Modal Pagination */}
                                    {txnTotalPages > 1 && (
                                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                Page <span className="text-black">{txnPage}</span> of <span className="text-black">{txnTotalPages}</span>
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setTxnPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={txnPage === 1}
                                                    className="p-1.5 border border-gray-200 rounded-lg hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                                >
                                                    <HiOutlineChevronLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setTxnPage(prev => Math.min(prev + 1, txnTotalPages))}
                                                    disabled={txnPage === txnTotalPages}
                                                    className="p-1.5 border border-gray-200 rounded-lg hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                                >
                                                    <HiOutlineChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
