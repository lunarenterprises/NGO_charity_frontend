import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaChartLine, FaShieldAlt, FaSyncAlt, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import instance from '../../Services/instance';
import { createMonthlyDonationOrderApi, verifyMonthlyDonationPaymentApi, getMonthlyDonorStatusApi, createBulkMonthlyDonationOrderApi, verifyBulkMonthlyDonationPaymentApi, enrollAsMonthlyDonorApi } from '../../Services/userApi';
import { showToast } from '../../Utils/alert';

const FIXED_AMOUNT = 1000;

const benefits = [
    {
        icon: <FaCalendarAlt className="w-5 h-5" />,
        title: "Consistent Impact",
        desc: "Uninterrupted support for projects that depend on steady, predictable funding every month.",
    },
    {
        icon: <FaChartLine className="w-5 h-5" />,
        title: "Smarter Planning",
        desc: "Predictable income lets us launch new programs and allocate resources with confidence.",
    },
    {
        icon: <FaShieldAlt className="w-5 h-5" />,
        title: "Donor Protection",
        desc: "Complete transparency, security, and accountability on every contribution you make.",
    },
    {
        icon: <FaSyncAlt className="w-5 h-5" />,
        title: "Effortless Giving",
        desc: "Set it once and your donation works around the clock — no follow-up needed.",
    },
];

const MonthlyDonation = () => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [donorStatus, setDonorStatus] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setInitialLoading(false);
                return;
            }
            try {
                const res = await getMonthlyDonorStatusApi();
                const statusData = res?.data?.data || res?.data;
                if (statusData && statusData.isMonthlyDonor) {
                    setDonorStatus(statusData);
                    // If they are a donor, show the payment or caught up screen
                    setSubmitted(true);
                }
            } catch (error) {
                console.error("Failed to fetch donor status", error);
            } finally {
                setInitialLoading(false);
            }
        };
        checkStatus();
    }, []);

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    const confirmEnrollment = async () => {
        setIsModalOpen(false);
        setLoading(true);
        setError('');
        try {
            await enrollAsMonthlyDonorApi();
            setSubmitted(true);
            showToast('success', 'Successfully enrolled as a Monthly Donor!');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Enrollment failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (amount, isBulk = false, selectedMonths = []) => {
        const amountToPay = amount || FIXED_AMOUNT;

        setLoading(true);
        setError('');
        try {
            // 1. Create Order
            const orderPayload = isBulk ? {} : {
                month: selectedMonths[0]?.month,
                year: selectedMonths[0]?.year
            };

            const orderRes = isBulk
                ? await createBulkMonthlyDonationOrderApi(orderPayload)
                : await createMonthlyDonationOrderApi(orderPayload);

            const rawData = orderRes.data?.data || orderRes.data;
            const orderData = rawData?.order || rawData;

            if (!orderData || !orderData.id) {
                showToast("error", "Failed to create order. Please try again.");
                setLoading(false);
                return;
            }

            // 2. Initialize Razorpay
            if (!window.Razorpay) {
                showToast("error", "Razorpay SDK failed to load. Please check your connection.");
                setLoading(false);
                return;
            }

            const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || rawData?.keyId || orderData?.keyId || "rzp_test_SNRWFVH0MOhtgj";

            // Get user info for prefill
            const storedUser = localStorage.getItem('user');
            let donorName = '', donorEmail = '', donorPhone = '';
            if (storedUser) {
                try {
                    const userObj = JSON.parse(storedUser);
                    donorName = userObj.fullname || userObj.username || userObj.name || '';
                    donorEmail = userObj.email || '';
                    donorPhone = userObj.phone || '';
                } catch (e) { }
            }

            const options = {
                key: razorpayKey,
                amount: orderData.amount, // amount in paise
                currency: "INR",
                name: "Yashfi Foundation",
                description: isBulk ? "Bulk Monthly Contribution" : (donorStatus ? "Monthly Contribution" : "First Month Contribution"),
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        setLoading(true);
                        // 3. Verify Payment
                        const verifyPayload = isBulk ? {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            pendingMonths: selectedMonths
                        } : {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            month: selectedMonths[0]?.month,
                            year: selectedMonths[0]?.year
                        };

                        if (isBulk) {
                            await verifyBulkMonthlyDonationPaymentApi(verifyPayload);
                        } else {
                            await verifyMonthlyDonationPaymentApi(verifyPayload);
                        }

                        navigate('/payment-success', {
                            state: {
                                amount: amountToPay,
                                transactionId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                projectTitle: isBulk ? "Bulk Monthly Donation" : "Monthly Donation",
                                isMonthly: true
                            }
                        });
                    } catch (error) {
                        console.error("Payment verification failed", error);
                        showToast("error", "Payment verification failed.");
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: donorName,
                    email: donorEmail,
                    contact: donorPhone
                },
                theme: { color: "#000000" },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error("Payment failed", response.error);
                showToast("error", response.error.description || "Payment Failed. Try again.");
                setLoading(false);
            });
            rzp.open();

        } catch (error) {
            console.error("Order creation failed", error);
            setError(error.response?.data?.message || "Something went wrong initiating payment.");
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-white">
            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform scale-100">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <FaCalendarAlt className="w-8 h-8 text-black" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-black text-center mb-2">Confirm Enrollment</h3>
                        <p className="text-gray-500 text-center font-medium mb-8">
                            By confirming, you pledge to contribute <span className="text-black font-bold">₹{FIXED_AMOUNT}</span> every month to support our ongoing initiatives.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmEnrollment}
                                className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-900 transition-all shadow-lg"
                            >
                                Yes, Confirm Enrollment
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-full py-4 bg-white text-black font-bold border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden bg-black text-white">
                <div className="absolute inset-0 opacity-15">
                    <img
                        src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest uppercase bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                        Give Regularly
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
                        Become a <br />
                        <span className="text-gray-400">Monthly Donor.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 leading-relaxed font-medium">
                        A small, consistent commitment from you creates a stable foundation for communities in need — every single month.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                        {/* Left — Info + Benefits */}
                        <div>
                            <span className="text-black font-bold uppercase tracking-[0.2em] text-sm mb-4 block">Why Monthly?</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight leading-tight mb-8">
                                Your recurring gift <br />changes everything.
                            </h2>
                            <div className="space-y-5 text-gray-600 text-lg leading-relaxed font-medium mb-12">
                                <p>
                                    Monthly donations are the cornerstone of sustainable impact. When you commit to giving regularly, you provide our team the predictability to plan long-term programs and reach more people.
                                </p>
                                <p>
                                    Your recurring contribution directly powers education initiatives, healthcare outreach, and food security projects across communities that depend on consistent support throughout the year.
                                </p>
                            </div>


                        </div>

                        {/* Right — Donation Card */}
                        <div className="relative rounded-[40px] overflow-hidden bg-black text-white p-10 shadow-2xl">

                            {/* Subtle background pattern */}
                            <div className="absolute inset-0 opacity-5"
                                style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                            </div>

                            {submitted ? (
                                <div className="relative z-10 flex flex-col items-center justify-center py-16 text-center gap-6">
                                    {(() => {
                                        const pendingMonths = donorStatus?.monthlyHistory?.filter(item =>
                                            !(item.status === 'paid' || item.status === 'success' || (item.donation && item.donation.paymentStatus === 'success'))
                                        ) || [];
                                        const hasPending = pendingMonths.length > 0;
                                        const isCompletelyCaughtUp = donorStatus && !hasPending;

                                        const now = new Date();
                                        const isCurrentMonthPending = pendingMonths.some(item =>
                                            item.month === (now.getMonth() + 1) && item.year === now.getFullYear()
                                        );
                                        const totalPendingAmount = FIXED_AMOUNT * (pendingMonths.length || 1);

                                        if (isCompletelyCaughtUp) {
                                            return (
                                                <>
                                                    <div className="flex items-center justify-center w-20 h-20 bg-green-500 rounded-full shadow-lg shadow-black/10">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="w-10 h-10 text-white"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-3xl font-bold text-white">All Caught Up!</h3>
                                                    <p className="text-gray-400 font-medium max-w-xs">
                                                        Thank you for your incredible consistency. All your monthly contributions are up to date!
                                                    </p>
                                                </>
                                            );
                                        }

                                        return (
                                            <>
                                                <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg shadow-black/10">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="w-10 h-10 text-black"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                                                        />
                                                    </svg>
                                                </div>
                                                <h3 className="text-3xl font-bold text-white">
                                                    {pendingMonths.length > 1 ? "Pending Payments" : "Pending Payment"}
                                                </h3>
                                                <p className="text-gray-400 font-medium max-w-xs">
                                                    {donorStatus
                                                        ? (pendingMonths.length > 1
                                                            ? `You have ${pendingMonths.length} months of contributions pending.`
                                                            : `Your contribution for this month is pending.`)
                                                        : `Your monthly donor profile has been set up successfully.`}
                                                </p>
                                                {error && (
                                                    <p className="text-red-400 text-sm font-medium text-center mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                                        {error}
                                                    </p>
                                                )}
                                                <div className="flex flex-col items-center gap-4 mt-4 w-full">
                                                    {donorStatus && isCurrentMonthPending && pendingMonths.length > 1 && (
                                                        <div className="w-full flex flex-col items-center gap-2">
                                                            <button
                                                                onClick={() => handlePayment(FIXED_AMOUNT, false, [{ month: now.getMonth() + 1, year: now.getFullYear() }])}
                                                                disabled={loading}
                                                                className="px-8 py-4 bg-white/10 text-white border border-white/20 font-bold rounded-2xl hover:bg-white/20 transition-all shadow-xl hover:-translate-y-1 w-full sm:w-auto sm:min-w-[350px] disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                                            >
                                                                Pay Only Current Month (₹{FIXED_AMOUNT})
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className="w-full flex flex-col items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                if (pendingMonths.length === 0) {
                                                                    handlePayment(FIXED_AMOUNT, false, [{ month: now.getMonth() + 1, year: now.getFullYear() }]);
                                                                } else if (pendingMonths.length === 1) {
                                                                    handlePayment(totalPendingAmount, false, [{ month: pendingMonths[0].month, year: pendingMonths[0].year }]);
                                                                } else {
                                                                    handlePayment(totalPendingAmount, true, pendingMonths.map(m => ({ month: m.month, year: m.year })));
                                                                }
                                                            }}
                                                            disabled={loading}
                                                            className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-xl hover:-translate-y-1 w-full sm:w-auto sm:min-w-[350px] disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                                        >
                                                            {loading ? 'Processing...' : (donorStatus ? (pendingMonths.length > 1 ? "Pay All Pending Contributions" : "Pay This Month's Contribution") : "Pay First Month's Contribution")}
                                                        </button>
                                                        <p className="text-gray-500 text-xs font-medium">
                                                            Proceed to pay your {pendingMonths.length > 1 ? `₹${FIXED_AMOUNT} × ${pendingMonths.length} = ` : ""}₹{totalPendingAmount}
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="relative z-10">
                                    {/* Tag */}
                                    <span className="inline-block px-4 py-1.5 mb-8 text-xs font-bold tracking-widest uppercase bg-white/10 border border-white/20 rounded-full">
                                        Monthly Plan
                                    </span>

                                    {/* Amount badge */}
                                    <div className="mb-3">
                                        <div className="flex items-end gap-2 mb-1">
                                            <span className="text-6xl font-bold tracking-tight text-white">₹{FIXED_AMOUNT}</span>
                                            <span className="text-gray-400 font-semibold text-xl mb-2">/month</span>
                                        </div>
                                        <p className="text-gray-400 font-medium text-sm">Billed automatically every month. Cancel anytime.</p>
                                    </div>

                                    <hr className="border-white/10 mb-3" />

                                    {/* What's included */}
                                    <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-5">What's included</p>
                                    <ul className="space-y-4 mb-7">
                                        {[
                                            "Monthly impact report delivered to your inbox",
                                            "Direct contribution to generous donations",
                                            "Donor recognition on our website",
                                            "Priority access to foundation events",
                                            "Tax exemption certificate (80G)",
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="mt-0.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                                    <FaCheckCircle className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="text-gray-300 font-medium text-sm leading-snug">{item}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <form onSubmit={handleInitialSubmit}>
                                        {error && (
                                            <p className="text-red-400 text-sm font-medium text-center mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                                {error}
                                            </p>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all transform hover:-translate-y-1 shadow-xl text-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin w-5 h-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                    </svg>
                                                    <span>Enrolling...</span>
                                                </>
                                            ) : (
                                                <span>Join as a Monthly Donor</span>
                                            )}
                                        </button>
                                        <p className="text-center text-xs text-gray-600 font-medium mt-4">
                                            Secure &amp; encrypted. Receipts sent to your email.
                                        </p>
                                    </form>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Monthly Payment History */}
                    <div className="mt-20">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                            <div>
                                <span className="text-black font-bold uppercase tracking-[0.2em] text-sm mb-2 block">Payment History</span>
                                <h3 className="text-3xl font-bold text-black tracking-tight">Monthly Contribution Status</h3>
                            </div>
                            {/* Summary chips */}
                            {(() => {
                                const history = donorStatus?.monthlyHistory || [];
                                const paidMonths = history.filter(item =>
                                    item.status === 'paid' ||
                                    item.status === 'success' ||
                                    (item.donation && item.donation.paymentStatus === 'success')
                                ).length;
                                const pendingMonths = history.filter(item => item.status === 'pending').length;

                                return (
                                    <div className="flex gap-3 flex-wrap">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
                                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                                            <span className="text-sm font-bold text-green-700">{paidMonths} Paid</span>
                                        </div>
                                        {pendingMonths > 0 && (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl">
                                                <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"></span>
                                                <span className="text-sm font-bold text-gray-600">{pendingMonths} Pending</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 px-4 py-2 bg-black rounded-xl">
                                            <span className="text-sm font-bold text-white">₹{FIXED_AMOUNT * history.length} tracked</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="bg-white rounded-[32px] border-2 border-gray-200 overflow-hidden">
                            {/* Table header */}
                            <div className="grid grid-cols-6 px-8 py-4 bg-gray-50 border-b border-gray-100">
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Month</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Date</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Transaction ID</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Amount</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Status</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Action</span>
                            </div>

                            {/* Dynamic Rows */}
                            {/* Dynamic Rows from Backend */}
                            {donorStatus?.monthlyHistory?.length > 0 ? (
                                donorStatus.monthlyHistory.map((item, index) => {
                                    const rowDate = new Date(item.year, item.month - 1, 1);
                                    const displayMonth = rowDate.toLocaleString('default', { month: 'long', year: 'numeric' });
                                    const isPaid = item.status === 'paid' || item.status === 'success' || (item.donation && item.donation.paymentStatus === 'success');

                                    const paymentDate = item.donation?.createdAt ? new Date(item.donation.createdAt).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' }) : "—";
                                    const txnId = item.donation?.razorpayPaymentId || item.donation?.id || null;

                                    return (
                                        <div
                                            key={`${item.year}-${item.month}`}
                                            className="grid grid-cols-6 px-8 py-5 items-center border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="font-semibold text-sm text-black">{displayMonth}</span>
                                            <span className="text-gray-500 text-sm font-medium">{isPaid ? paymentDate : "—"}</span>
                                            <span className="text-gray-500 text-xs font-mono">
                                                {txnId ?? <span className="text-gray-300">—</span>}
                                            </span>
                                            <span className="text-sm font-bold text-black">
                                                ₹{item.donation?.amount || FIXED_AMOUNT}
                                            </span>
                                            {/* Status */}
                                            <div>
                                                {isPaid ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                                                        Paid
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-lg border border-gray-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"></span>
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                            {/* Action */}
                                            <div className="flex justify-end">
                                                {isPaid ? (
                                                    <span className="text-gray-300 font-medium text-sm">—</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePayment(FIXED_AMOUNT, false, [{ month: item.month, year: item.year }])}
                                                        disabled={loading}
                                                        className="inline-flex items-center px-4 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Pay Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="px-8 py-12 text-center text-gray-400 font-medium">
                                    No contribution history found.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default MonthlyDonation;
