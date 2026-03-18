import { Link } from 'react-router-dom';
import { HiCheckCircle, HiArrowRight, HiCalendar } from 'react-icons/hi';
import { useEffect } from 'react';
import { clearRazorpayLocalData } from '../../Utils/razorpayUtils';
import { useAuth } from '../../Contexts/AuthContext';

const MonthlyDonationSuccess = ({ amount, transactionId }) => {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        clearRazorpayLocalData();
    }, []);

    return (
        <div className="min-h-screen overflow-y-auto overflow-x-hidden bg-gray-200 text-gray-900 flex flex-col justify-center pt-28 pb-12 relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-black/5 rounded-full -mr-64 -mt-64 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/5 rounded-full -ml-64 -mb-64 blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row gap-12 lg:items-center">

                    {/* Left: Text */}
                    <div className="lg:w-1/2 animate-in slide-in-from-left duration-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-black/5">
                                <HiCheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] block">Subscription Success</span>
                                <span className="font-bold text-xs uppercase tracking-widest text-green-600">
                                    Monthly Donation Activated
                                </span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.1] text-black">
                            Thank you for your <br />ongoing support.
                        </h1>

                        <div className="space-y-4 text-base text-gray-600 font-medium leading-relaxed mb-8">
                            <p>
                                Your monthly commitment of <span className="text-black font-black text-lg">₹{parseFloat(amount).toLocaleString('en-IN')}</span> has been successfully activated.
                                This recurring contribution provides us with the stable support needed for long-term impact.
                            </p>
                            <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-gray-300 shadow-sm">
                                <HiCalendar className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-700">
                                    Your donation will be processed monthly. You can track your impact and manage your subscription anytime from your profile.
                                </p>
                            </div>
                        </div>

                        {/* Transaction Details Card */}
                        <div className="bg-white border border-gray-300 rounded-[24px] p-5 mb-6 space-y-3 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                            <div className="flex justify-between items-center group relative z-10">
                                <span className="text-gray-500 text-[10px] uppercase tracking-widest font-black">Monthly Amount</span>
                                <span className="text-black font-black text-lg tracking-tight">₹{parseFloat(amount).toLocaleString('en-IN')}</span>
                            </div>

                            <div className="flex justify-between items-center group border-t border-gray-200 pt-3 relative z-10">
                                <span className="text-gray-500 text-[10px] uppercase tracking-widest font-black">Transaction ID</span>
                                <span className="text-gray-700 font-mono font-bold text-[10px] bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 max-w-[150px] truncate" title={transactionId}>
                                    {transactionId}
                                </span>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/"
                                className="group px-8 py-4 bg-black text-white font-black rounded-2xl hover:bg-gray-800 transition-all transform hover:-translate-y-1 shadow-2xl flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                            >
                                Back to Home
                                <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            {isAuthenticated && (
                                <Link
                                    to="/monthly-donation"
                                    className="px-8 py-4 bg-white border-2 border-black text-black font-black rounded-2xl hover:bg-gray-50 transition-all transform hover:-translate-y-1 text-center text-sm uppercase tracking-widest"
                                >
                                    View My Plan
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right: Thematic Image Grid */}
                    <div className="lg:w-1/2 hidden lg:block animate-in fade-in zoom-in-95 duration-1000">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="group relative rounded-[32px] overflow-hidden drop-shadow-2xl h-48">
                                    <img
                                        src="https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                                        alt="Healthcare Equipment"
                                        className="h-full w-full object-cover grayscale-30 hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                                </div>
                                <div className="group relative rounded-[32px] overflow-hidden drop-shadow-2xl h-64">
                                    <img
                                        src="https://images.unsplash.com/photo-1550831107-1553da8c8464?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                                        alt="Medical Professional"
                                        className="h-full w-full object-cover grayscale-30 hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                                </div>
                            </div>
                            <div className="space-y-4 pt-12">
                                <div className="group relative rounded-[32px] overflow-hidden drop-shadow-2xl h-64">
                                    <img
                                        src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                                        alt="Medical Supplies"
                                        className="h-full w-full object-cover grayscale-30 hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                                </div>
                                <div className="group relative rounded-[32px] overflow-hidden drop-shadow-2xl h-48">
                                    <img
                                        src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                                        alt="Healthcare Support"
                                        className="h-full w-full object-cover grayscale-30 hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MonthlyDonationSuccess;
