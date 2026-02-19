import React from 'react';
import { HiOutlineArrowLeft, HiOutlineSearch, HiOutlineMail } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const Enquiries = () => {
    // Mock data for enquiries
    const enquiries = [
        { id: 'ENQ001', name: "Suresh Kumar", email: "suresh.k@example.com", date: "Feb 18, 2026", message: "Interested in volunteering for the clean water project. Please let me know the requirements." },
        { id: 'ENQ002', name: "Meera Nair", email: "meera.n@example.com", date: "Feb 17, 2026", message: "I want to know more about the corporate partnership programs for the education initiative." },
        { id: 'ENQ003', name: "Rajesh Pillai", email: "rajesh.p@example.com", date: "Feb 15, 2026", message: "Regarding the medical camp: Do you provide transportation for elderly patients from rural areas?" },
        { id: 'ENQ004', name: "Anita Desai", email: "anita.d@example.com", date: "Feb 12, 2026", message: "I donated yesterday but didn't receive an 80G receipt. Can you please check?" },
        { id: 'ENQ005', name: "Karthik Raja", email: "karthik.r@example.com", date: "Feb 10, 2026", message: "Is there any way to donate in kind (clothes, books) for the orphan support program?" },
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
                    placeholder="Search by name, email or message..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-black transition-all shadow-sm"
                />
            </div>

            {/* Enquiries Table Section */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 bg-black flex justify-between items-center">
                    <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-white">ENQUIRIES</h2>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{enquiries.length} New Enquiries</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Sender</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Inquiry ID</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Date</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black">Message</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-black text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enquiries.map((enq) => (
                                <tr key={enq.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <p className="text-sm font-bold text-black group-hover:underline transition-all underline-offset-4 decoration-gray-300">{enq.name}</p>
                                            <p className="text-[11px] text-gray-400 font-medium">{enq.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">#{enq.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-gray-500 font-medium">{enq.date}</p>
                                    </td>
                                    <td className="px-6 py-4 max-w-md">
                                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                            {enq.message}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100">
                                            <HiOutlineMail className="w-5 h-5" />
                                        </button>
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

export default Enquiries;
