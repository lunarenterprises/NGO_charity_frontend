import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { FaHandsHelping } from 'react-icons/fa';
import { createProjectDonationOrderApi, verifyProjectDonationPaymentApi } from '../../Services/userApi';
import { showToast } from '../../Utils/alert';

const ProjectDonationModal = ({ isOpen, onClose, project }) => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [donorName, setDonorName] = useState('');
    const [donorEmail, setDonorEmail] = useState('');
    const [donorPhone, setDonorPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const portalRoot = document.body;
    const presets = [250, 500, 1000, 5000];

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userObj = JSON.parse(storedUser);
                setDonorName(userObj.fullname || userObj.username || userObj.name || '');
                setDonorEmail(userObj.email || '');
                setDonorPhone(userObj.phone || '');
            } catch (err) {
                console.error("ProjectDonationModal: Failed to parse user", err);
            }
        }
    }, [isOpen]);

    if (!isOpen || !project) return null;

    const isLoggedIn = !!localStorage.getItem('user');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);

        if (!numAmount || numAmount <= 0) {
            showToast("error", "Please enter a valid amount");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create Project Order
            const orderRes = await createProjectDonationOrderApi({
                amount: numAmount,
                projectId: project.id || project._id
            });

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
                name: "Yashfi Foundation",
                description: `Donation for ${project.name || 'Project'}`,
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        setIsLoading(true);
                        // 3. Verify Payment
                        await verifyProjectDonationPaymentApi({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: numAmount,
                            projectId: project.id || project._id,
                            donorName,
                            donorEmail,
                            donorPhone
                        });

                        onClose();
                        navigate('/payment-success', {
                            state: {
                                amount: numAmount,
                                transactionId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                projectTitle: project.name
                            }
                        });
                    } catch (error) {
                        console.error("Project Payment verification failed", error);
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
                console.error("Project Payment failed", response.error);
                showToast("error", response.error.description || "Payment Failed. Try again.");
                setIsLoading(false);
            });
            rzp.open();

        } catch (error) {
            console.error("Project Order creation failed", error);
            showToast("error", error.response?.data?.message || "Something went wrong.");
            setIsLoading(false);
        }
    };

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
                        <div className="w-16 h-16 mb-4 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
                            <FaHandsHelping className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-black tracking-tight line-clamp-1 px-4">
                            Support {project.name}
                        </h2>
                        <p className="mt-1 text-gray-500 font-medium text-sm">Your contribution matters</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLoggedIn && (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={donorName}
                                    onChange={(e) => setDonorName(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-black outline-none transition-all text-sm font-semibold"
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={donorEmail}
                                    onChange={(e) => setDonorEmail(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-black outline-none transition-all text-sm font-semibold"
                                    required
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={donorPhone}
                                    onChange={(e) => setDonorPhone(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-black outline-none transition-all text-sm font-semibold"
                                    required
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-black transition-colors">
                                ₹
                            </div>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-10 pr-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all text-2xl font-bold placeholder:text-gray-300 appearance-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {presets.map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setAmount(val.toString())}
                                    className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 ${amount === val.toString()
                                        ? 'bg-black text-white border-black shadow-lg shadow-black/10'
                                        : 'bg-white text-gray-500 border-gray-100 hover:border-black hover:text-black'
                                        }`}
                                >
                                    ₹{val.toLocaleString('en-IN')}
                                </button>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 mt-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-900 transition-all shadow-xl shadow-black/10 flex justify-center items-center gap-2 group ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : null}
                            <span>{isLoading ? 'Processing...' : 'Complete Donation'}</span>
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

export default ProjectDonationModal;
