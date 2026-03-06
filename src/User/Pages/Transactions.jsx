import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { getUserDonationsApi } from '../../Services/userApi';
import { FaHistory, FaChevronLeft, FaChevronRight, FaFileInvoiceDollar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Transactions = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const fetchTransactions = async (currentPage) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getUserDonationsApi({ page: currentPage, limit });

            if (response?.data?.success) {
                setTransactions(response.data.data);

                // Use the 'meta' object from the API response for pagination
                if (response.data.meta) {
                    setTotalPages(response.data.meta.totalPages || 1);
                } else if (response.data.pagination) {
                    setTotalPages(response.data.pagination.totalPages || 1);
                } else if (response.data.total) {
                    setTotalPages(Math.ceil(response.data.total / limit));
                } else {
                    setTotalPages(response.data.data.length < limit ? currentPage : currentPage + 1);
                }
            } else {
                setError("Failed to fetch transaction history.");
            }
        } catch (err) {
            console.error("Transactions: API Error", err);
            setError("An error occurred while fetching your transactions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(page);
    }, [user, page]);

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(prev => prev + 1);
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'success':
            case 'confirmed':
                return <FaCheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed':
            case 'cancelled':
                return <FaTimesCircle className="w-5 h-5 text-red-500" />;
            default:
                return <FaFileInvoiceDollar className="w-5 h-5 text-blue-500" />; // Pending or other
        }
    };

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase() || 'pending';
        let bg = 'bg-gray-50';
        let text = 'text-gray-600';
        let border = 'border-gray-200';

        if (['completed', 'success', 'confirmed'].includes(s)) {
            bg = 'bg-green-50';
            text = 'text-green-600';
            border = 'border-green-200';
        } else if (['failed', 'cancelled'].includes(s)) {
            bg = 'bg-red-50';
            text = 'text-red-600';
            border = 'border-red-200';
        } else if (s === 'pending') {
            bg = 'bg-blue-50';
            text = 'text-blue-600';
            border = 'border-blue-200';
        }

        return (
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${bg} ${text} ${border}`}>
                {status || 'Pending'}
            </span>
        );
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-gray-50 px-6 md:px-12">
            <div className="w-full mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <FaHistory className="w-8 h-8 text-black" />
                        Donation History
                    </h1>
                    <p className="text-gray-500 font-medium">Review your past contributions and their impact.</p>
                </div>

                {error ? (
                    <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 flex items-center justify-center text-red-500 mb-4 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
                            <FaTimesCircle className="w-8 h-8" />
                        </div>
                        <p className="text-gray-900 font-bold mb-4">{error}</p>
                        <button
                            onClick={() => fetchTransactions(page)}
                            className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
                        >
                            Try Again
                        </button>
                    </div>
                ) : loading && transactions.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-bold animate-pulse text-sm">Loading your history...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-6 border border-gray-100">
                            <FaFileInvoiceDollar className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Transactions Yet</h3>
                        <p className="text-gray-500 font-medium max-w-md">
                            It looks like you haven't made any donations yet. Start making an impact today!
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center transition-opacity duration-300">
                                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-left">
                                        <th className="px-6 py-4 rounded-tl-3xl border-r border-transparent">Date</th>
                                        <th className="px-6 py-4 border-l border-transparent">Project</th>
                                        <th className="px-6 py-4 border-l border-transparent">Transaction ID</th>
                                        <th className="px-6 py-4 border-l border-transparent">Status</th>
                                        <th className="px-6 py-4 rounded-tr-3xl text-right border-l border-transparent">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                                    {transactions.map((t) => (
                                        <tr key={t.id || t._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {new Date(t.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[11px] font-semibold text-gray-400">
                                                        {new Date(t.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400  group-hover:text-white transition-colors">
                                                        {getStatusIcon(t.paymentStatus || t.status)}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-800">
                                                        {t.Project ? (t.Project.name || t.Project.title) : (t.project ? (t.project.name || t.project.title) : 'General Donation')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                                                    {t.razorpayPaymentId || t.paymentId || t.orderId || (t.id || t._id)?.toString().substring(0, 12)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                {getStatusBadge(t.paymentStatus || t.status)}
                                            </td>
                                            <td className="px-6 py-5 text-right whitespace-nowrap">
                                                <span className="text-base font-bold text-black">
                                                    ₹{Number(t.amount || 0).toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="px-6 py-5 bg-white border-t border-gray-100 rounded-b-3xl flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500">
                                Page {page} of {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={page === 1}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${page === 1
                                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-black shadow-sm'
                                        }`}
                                >
                                    <FaChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={page >= totalPages}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${page >= totalPages
                                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-black hover:text-white shadow-sm hover:shadow-black/10'
                                        }`}
                                >
                                    <FaChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
