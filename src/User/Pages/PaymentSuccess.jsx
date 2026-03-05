import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { HiCheckCircle, HiArrowRight } from 'react-icons/hi';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { amount, transactionId } = location.state || {};

    useEffect(() => {
        if (!location.state) {
            const timer = setTimeout(() => navigate('/'), 5000);
            return () => clearTimeout(timer);
        }
    }, [location.state, navigate]);

    if (!location.state) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">No transaction details found.</h1>
                <p className="text-gray-600 mb-8">Redirecting you to home page...</p>
                <Link to="/" className="text-black font-bold underline">Go back now</Link>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden bg-black text-white flex items-center">
            <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
                <div className="flex flex-col lg:flex-row gap-10 lg:items-center">

                    {/* Left: Text */}
                    <div className="lg:w-1/2">
                        <div className="flex items-center gap-2 mb-4">
                            <HiCheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Payment Confirmed</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5 leading-tight">
                            Thank you for <br />your generosity.
                        </h1>

                        <div className="space-y-3 text-base text-gray-400 font-medium leading-relaxed mb-6">
                            <p>
                                Your donation of <span className="text-white font-bold">₹{parseFloat(amount).toLocaleString('en-IN')}</span> has been received and will go directly toward supporting our active projects and communities in need.
                            </p>
                            <p>
                                Every contribution helps us build schools, provide meals, and create opportunities for thousands of families. Your act of kindness sparks hope and drives lasting change.
                            </p>
                        </div>

                        {/* Transaction Details */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mb-6 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs uppercase tracking-widest font-bold">Amount Paid</span>
                                <span className="text-white font-black text-base">₹{parseFloat(amount).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="border-t border-white/10 pt-3 flex justify-between items-center gap-4">
                                <span className="text-gray-400 text-xs uppercase tracking-widest font-bold shrink-0">Transaction ID</span>
                                <span className="text-white font-mono font-bold text-sm truncate" title={transactionId}>{transactionId}</span>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/"
                                className="group px-7 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:-translate-y-0.5 shadow-xl flex items-center justify-center gap-2 text-sm"
                            >
                                Back to Home
                                <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/active-projects"
                                className="px-7 py-3.5 border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all transform hover:-translate-y-0.5 text-center text-sm"
                            >
                                Explore Projects
                            </Link>
                        </div>
                    </div>

                    {/* Right: Image Grid */}
                    <div className="lg:w-1/2 hidden lg:block">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-3">
                                <img
                                    src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                                    alt="Family together"
                                    className="rounded-2xl h-36 w-full object-cover shadow-2xl"
                                />
                                <img
                                    src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                                    alt="Sharing kindness"
                                    className="rounded-2xl h-52 w-full object-cover shadow-2xl"
                                />
                            </div>
                            <div className="space-y-3 pt-8">
                                <img
                                    src="https://images.unsplash.com/photo-1504159506876-f8338247a14a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                                    alt="Kids playing"
                                    className="rounded-2xl h-52 w-full object-cover shadow-2xl"
                                />
                                <img
                                    src="https://images.unsplash.com/photo-1526958097901-5e6d742d3371?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                                    alt="Making a difference"
                                    className="rounded-2xl h-36 w-full object-cover shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
