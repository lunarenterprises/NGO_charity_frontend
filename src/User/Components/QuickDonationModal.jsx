import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { FaHeart } from 'react-icons/fa';
import { createQuickDonationOrderApi, verifyQuickDonationPaymentApi } from '../../Services/userApi';
import { showToast } from '../../Utils/alert';
import { useAuth } from '../../Contexts/AuthContext';

const QuickDonationModal = ({ onClose }) => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [donorName, setDonorName] = useState('');
    const [donorEmail, setDonorEmail] = useState('');
    const [donorPhone, setDonorPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const portalRoot = document.body;

    const presets = [250, 500, 1000, 10000];

    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (user) {
            setDonorName(user.username || user.fullname || user.name || '');
            setDonorEmail(user.email || '');
            setDonorPhone(user.phone || '');
        }
    }, [user]);

    const isLoggedIn = isAuthenticated;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) {
            showToast("error", "Please enter a valid amount");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create Order
            const orderRes = await createQuickDonationOrderApi({ amount: parseFloat(amount) });
            const orderData = orderRes.data?.data || orderRes.data?.order || orderRes.data;

            if (!orderData || !orderData.id) {
                showToast("error", "Failed to create order. Please try again.");
                setIsLoading(false);
                return;
            }

            // 2. Initialize Razorpay
            if (!window.Razorpay) {
                showToast("error", "Razorpay SDK failed to load. Please check your connection.");
                setIsLoading(false);
                return;
            }

            const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || orderData.keyId || "rzp_test_SNRWFVH0MOhtgj";

            const options = {
                key: razorpayKey,
                amount: orderData.amount, // amount in paise
                currency: "INR",
                name: "Yashfi Foundation Donation",
                description: "Quick Donation",
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        setIsLoading(true);
                        // 3. Verify Payment
                        await verifyQuickDonationPaymentApi({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: parseFloat(amount),
                            donorName,
                            donorEmail,
                            donorPhone
                        });

                        onClose();
                        navigate('/payment-success', {
                            state: {
                                amount: parseFloat(amount),
                                transactionId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id
                            }
                        });
                    } catch (error) {
                        console.error("Payment verification failed", error);
                        showToast("error", "Payment verification failed.");
                    } finally {
                        setIsLoading(false);
                    }
                },
                prefill: {
                    name: donorName,
                    email: donorEmail,
                    contact: donorPhone
                },
                theme: {
                    color: "#000000"
                },
                modal: {
                    ondismiss: function () {
                        setIsLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error("Payment failed", response.error);
                showToast("error", response.error.description || "Payment Failed. Try again.");
                setIsLoading(false);
            });
            rzp.open();

        } catch (error) {
            console.error("Order creation failed", error);
            showToast("error", error.response?.data?.message || "Something went wrong.");
            setIsLoading(false);
        }
    };

    const isFormValid = (isLoggedIn || (donorName.trim() && donorEmail.trim())) && amount && parseFloat(amount) > 0;

    const modalContent = (
        <div className="fixed inset-0 z-110 grid place-items-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all duration-200 z-10"
                >
                    <IoClose className="w-6 h-6" />
                </button>

                <div className="p-8 md:p-10">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-13 h-13 mb-1 bg-black text-white rounded-2xl flex items-center justify-center">
                            <FaHeart className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-black tracking-tight">Enter Amount</h2>
                        <p className=" text-gray-500 font-medium">Support our general fund directly</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLoggedIn && (
                            <div className="space-y-3.5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-700 ml-1 flex items-center gap-1">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        value={donorName}
                                        onChange={(e) => setDonorName(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-black outline-none transition-all duration-200 text-sm"
                                        required={!isLoggedIn}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-700 ml-1 flex items-center gap-1">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="e.g. john@example.com"
                                        value={donorEmail}
                                        onChange={(e) => setDonorEmail(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-black outline-none transition-all duration-200 text-sm"
                                        required={!isLoggedIn}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-700 ml-1 flex items-center gap-2">
                                        Phone Number <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">(Optional)</span>
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="e.g. +91 98765 43210"
                                        value={donorPhone}
                                        onChange={(e) => setDonorPhone(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-black outline-none transition-all duration-200 text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="relative group mt-5">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-black group-focus-within:text-black transition-colors">
                                ₹
                            </div>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-9 pr-4 py-3 bg-gray-100 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all duration-200 text-xl font-bold placeholder:text-gray-400 appearance-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {presets.map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setAmount(val.toString())}
                                    className={`py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 border-2 ${amount === val.toString()
                                        ? 'bg-black text-white border-black shadow-lg shadow-black/10'
                                        : 'bg-white text-gray-600 border-gray-100 hover:border-black hover:text-black'
                                        }`}
                                >
                                    ₹{val.toLocaleString('en-IN')}
                                </button>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !isFormValid}
                            className={`w-full py-4 mt-6 rounded-2xl font-bold transition-all duration-300 flex justify-center items-center gap-2
                                ${isLoading || !isFormValid
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none grayscale'
                                    : 'bg-black text-white hover:bg-gray-900 shadow-xl shadow-black/10 hover:shadow-black/20 transform hover:-translate-y-0.5'
                                }`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : null}
                            <span>{isLoading ? 'Processing...' : 'Donate Now'}</span>
                        </button>
                    </form>
                </div>
            </div>

            {/* Overlay background click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );

    return ReactDOM.createPortal(modalContent, portalRoot);
};

export default QuickDonationModal;
