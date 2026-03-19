import React, { useState, useEffect } from 'react';
import { HiOutlineArrowLeft, HiOutlineSearch, HiOutlineDownload, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { getAllDonationsApi } from '../../Services/adminApi';

const RecentTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const itemsPerPage = 10;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchTransactions();
    }, [debouncedSearch, currentPage]);

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearch
            };
            const result = await getAllDonationsApi(params);

            if (result.status === 200 && result.data) {
                const responseData = result.data;

                if (responseData.success || responseData.result) {
                    const donations = responseData.data || [];
                    setTransactions(donations);

                    // Handle pagination from various response formats
                    if (responseData.meta) {
                        setTotalPages(responseData.meta.totalPages || 1);
                        setTotalRecords(responseData.meta.total || donations.length);
                    } else if (responseData.pagination) {
                        setTotalPages(responseData.pagination.totalPages || 1);
                        setTotalRecords(responseData.pagination.total || donations.length);
                    } else if (responseData.totalPages) {
                        setTotalPages(responseData.totalPages);
                        setTotalRecords(responseData.total || donations.length);
                    } else {
                        setTotalPages(donations.length < itemsPerPage ? currentPage : currentPage + 1);
                        setTotalRecords(donations.length);
                    }
                } else {
                    setTransactions([]);
                    setError(responseData.message || "Failed to fetch transactions");
                }
            } else {
                // Don't treat 401 as fatal — interceptor handles token refresh
                const status = result.response?.status || result.status;
                if (status === 401) {
                    setTimeout(() => fetchTransactions(), 1000);
                    return;
                }
                setError(result.response?.data?.message || "Failed to fetch transactions");
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setTimeout(() => fetchTransactions(), 1000);
                return;
            }
            setError("Something went wrong while fetching transactions");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const getDonationType = (txn) => {
        if (txn.isMonthly || txn.type === 'monthly') {
            const amount = Number(txn.amount);
            if (amount > 1000 && amount % 1000 === 0) {
                return `Monthly Donation (1000 * ${txn.count || (amount / 1000)})`;
            }
            return 'Monthly Donation';
        }
        if (txn.project) {
            if (typeof txn.project === 'string') return txn.project;
            return txn.project.name || txn.project.title || 'Project Donation';
        }
        if (txn.Project) return txn.Project.name || txn.Project.title || 'Project Donation';
        return 'Quick Donation';
    };

    const isQuickDonation = (txn) => {
        return !txn.Project && !txn.project && !txn.isMonthly && txn.type !== 'monthly';
    };

    const getStatusBadge = (status) => {
        const s = (status || 'pending').toLowerCase();
        if (['completed', 'success', 'confirmed'].includes(s)) {
            return <span className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter bg-green-100 text-green-700">{status}</span>;
        } else if (['failed', 'cancelled'].includes(s)) {
            return <span className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter bg-red-100 text-red-600">{status}</span>;
        }
        return <span className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter bg-yellow-100 text-yellow-700">{status || 'Pending'}</span>;
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
                        <h1 className="text-2xl font-bold text-black tracking-tight">Recent Transactions</h1>
                        <p className="text-sm text-gray-500">Comprehensive log of all Yashfi Foundation contributions.</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96 group">
                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors w-5 h-5" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search donors, emails, or transactions..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-black transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Transactions Table Section */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm min-h-[400px]">
                <div className="p-6 border-b border-gray-100 bg-black flex justify-between items-center">
                    <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-white">Transaction History</h2>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{totalRecords} Records</span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-black uppercase tracking-widest">Loading Transactions...</p>
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
                            onClick={fetchTransactions}
                            className="px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-gray-900 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center">
                            <HiOutlineSearch className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-black uppercase tracking-widest">No transactions found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Donor Name</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Donation Type</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Contact Info</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black text-center">Date</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black text-center">Status</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((txn) => (
                                        <tr key={txn._id || txn.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-bold text-black group-hover:underline transition-all underline-offset-4 decoration-gray-300">
                                                        {txn.donorName || txn.name || txn.User?.fullname || txn.user?.fullname || 'Anonymous'}
                                                    </p>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase">
                                                        ID: {(txn.razorpayPaymentId || txn.paymentId || txn._id || txn.id)?.toString().substring(0, 15)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-2 rounded text-[9px] font-semibold uppercase tracking-tighter ${isQuickDonation(txn) ? 'bg-gray-200 text-gray-500' : 'bg-black text-white'}`}>
                                                    {getDonationType(txn)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-sm text-black font-semibold tracking-tight">
                                                        {txn.donorEmail || txn.email || txn.User?.email || txn.user?.email || 'N/A'}
                                                    </p>
                                                    <p className="text-[13px] text-gray-400 font-medium">
                                                        {txn.donorPhone || txn.phone || txn.User?.phone || txn.user?.phone || 'N/A'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-700 font-medium">{formatDate(txn.createdAt || txn.date)}</span>
                                                    <span className="text-[10px] text-gray-400">{formatTime(txn.createdAt || txn.date)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getStatusBadge(txn.paymentStatus || txn.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-black text-black bg-gray-100 px-3 py-1 rounded-md">
                                                    ₹{Number(txn.amount || 0).toLocaleString('en-IN')}
                                                </span>
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
        </div>
    );
};

export default RecentTransactions;
