import React, { useState, useEffect } from 'react';
import { HiOutlineArrowLeft, HiOutlineSearch, HiOutlineMail, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { getAllEnquiriesApi } from '../../Services/adminApi';

const Enquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchEnquiries();
    }, [currentPage, debouncedSearch]);

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearch
            };
            const result = await getAllEnquiriesApi(params);
            if (result.status === 200) {
                // Adjust based on the expected paginated response structure
                // Assuming result.data.data contains the array and result.data has pagination info
                // OR result.data contains the array directly. 
                // Given the user request, the backend likely returns an object with list and meta info.
                const responseData = result.data.data || result.data;

                if (Array.isArray(responseData)) {
                    setEnquiries(responseData);
                    // If no pagination info, assume only 1 page
                    setTotalPages(1);
                } else if (responseData && responseData.enquiries) {
                    setEnquiries(responseData.enquiries);
                    setTotalPages(responseData.totalPages || 1);
                } else {
                    setEnquiries([]);
                }
            } else {
                setError(result.response?.data?.message || "Failed to fetch enquiries");
            }
        } catch (err) {
            setError("Something went wrong while fetching enquiries");
        } finally {
            setLoading(false);
        }
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
                        <h1 className="text-2xl font-bold text-black tracking-tight">Enquiries</h1>
                        <p className="text-sm text-gray-500">Respond to and manage all portal inquiries from users.</p>
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
                    placeholder="Search by name or email "
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-black transition-all shadow-sm"
                />
            </div>

            {/* Enquiries Table Section */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm min-h-[400px]">
                <div className="p-6 border-b border-gray-100 bg-black flex justify-between items-center">
                    <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-white">ENQUIRIES</h2>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{enquiries.length} Enquiries on this page</span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-black uppercase tracking-widest">Loading Enquiries...</p>
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
                            onClick={fetchEnquiries}
                            className="px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-gray-900 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                ) : enquiries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center">
                            <HiOutlineSearch className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-black uppercase tracking-widest">No enquiries found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Sender</th>
                                        
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Date</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Message</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enquiries.map((enq) => (
                                        <tr key={enq._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-bold text-black group-hover:underline transition-all underline-offset-4 decoration-gray-300">{enq.fullname}</p>
                                                    <p className="text-[11px] text-gray-400 font-medium">{enq.email}</p>
                                                </div>
                                            </td>
                                          
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    }) : 'N/A'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 max-w-md">
                                                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                    {enq.message}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <a
                                                    href={`mailto:${enq.email}`}
                                                    className="p-2 inline-block text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
                                                >
                                                    <HiOutlineMail className="w-5 h-5" />
                                                </a>
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

export default Enquiries;
