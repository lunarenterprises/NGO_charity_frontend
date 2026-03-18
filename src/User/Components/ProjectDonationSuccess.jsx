import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiCheckCircle, HiArrowRight } from 'react-icons/hi';
import { clearRazorpayLocalData } from '../../Utils/razorpayUtils';
import { useAuth } from '../../Contexts/AuthContext';

const ProjectDonationSuccess = ({ amount, transactionId, projectTitle }) => {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        clearRazorpayLocalData();
    }, []);

    return (
        <div className="min-h-screen overflow-y-auto overflow-x-hidden bg-indigo-950 text-white flex flex-col justify-center pt-28 pb-12 relative transition-colors duration-700">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -mr-64 -mt-64 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px]  bg-white/5 rounded-full -ml-64 -mb-64 blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row gap-12 lg:items-center">

                    {/* Left: Text */}
                    <div className="lg:w-1/2 animate-in slide-in-from-left duration-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-white/10">
                                <HiCheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] block">Donation Success</span>
                                <span className="font-bold text-xs uppercase tracking-widest text-indigo-400">
                                    Project Support Confirmed
                                </span>
                            </div>
                        </div>

                        <h1 className="text-2xl sm:text-4xl  font-black tracking-tight mb-6 leading-[1.1]">
                            Thank you for supporting <br /><span className="text-4xl md:text-5xl lg:text-6xl text-indigo-400">{projectTitle}</span>
                        </h1>

                        <div className="space-y-4 text-base text-gray-400 font-medium leading-relaxed mb-8">
                            <p>
                                Your contribution of <span className="text-white font-black text-lg">₹{parseFloat(amount).toLocaleString('en-IN')}</span> has been successfully processed.
                                Your support for <span className="text-white font-bold">{projectTitle}</span> will make a direct and immediate impact on this specific cause.
                            </p>
                            <p className="text-sm opacity-80">
                                Every contribution helps us build and create opportunities for thousands of people.Your act of kindness sparks hope and drives lasting change
                            </p>
                        </div>

                        {/* Transaction Details Card */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] p-5 mb-6 space-y-3 shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                            <div className="flex justify-between items-center group">
                                <span className="text-gray-500 text-[10px] uppercase tracking-widest font-black">Final Amount</span>
                                <span className="text-white font-black text-lg tracking-tight">₹{parseFloat(amount).toLocaleString('en-IN')}</span>
                            </div>

                            <div className="flex justify-between items-center group border-t border-white/5 pt-3">
                                <span className="text-gray-500 text-[10px] uppercase tracking-widest font-black">Transaction ID</span>
                                <span className="text-white/80 font-mono font-bold text-[10px] bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 max-w-[150px] truncate" title={transactionId}>
                                    {transactionId}
                                </span>
                            </div>

                            <div className="flex justify-between items-center group border-t border-white/5 pt-3">
                                <span className="text-gray-500 text-[10px] uppercase tracking-widest font-black">Project</span>
                                <span className="text-indigo-400 font-bold text-[10px] text-right max-w-[200px] truncate">{projectTitle}</span>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/"
                                className="group px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-100 transition-all transform hover:-translate-y-1 shadow-2xl flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                            >
                                Back to Home
                                <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            {isAuthenticated && (
                                <Link
                                    to="/transactions"
                                    className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all transform hover:-translate-y-1 text-center text-sm uppercase tracking-widest"
                                >
                                    View History
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right: Thematic Image Grid */}
                    <div className="lg:w-1/2 hidden lg:block animate-in fade-in zoom-in-95 duration-1000">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="group relative rounded-[32px] overflow-hidden drop-shadow-2xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=400&q=80"
                                        alt="Impact"
                                        className="h-36 w-full object-cover grayscale-30 hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                                </div>
                                <div className="group relative rounded-[32px] overflow-hidden drop-shadow-2xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=400&q=80"
                                        alt="Helping hands"
                                        className="h-56 w-full object-cover grayscale-30 hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                                </div>
                            </div>
                            <div className="space-y-4 pt-8">
                                <div className="group relative rounded-[32px] overflow-hidden drop-shadow-2xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=400&q=80"
                                        alt="Children"
                                        className="h-56 w-full object-cover grayscale-30 hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                                </div>
                                <div className="group relative rounded-[32px] overflow-hidden drop-shadow-2xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=400&q=80"
                                        alt="Hope"
                                        className="h-36 w-full object-cover grayscale-30 hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProjectDonationSuccess;
