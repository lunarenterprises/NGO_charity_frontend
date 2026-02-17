import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { FaHeart } from 'react-icons/fa';

const QuickDonationModal = ({ onClose }) => {
    const [amount, setAmount] = useState('');
    const portalRoot = document.body;

    const presets = [250, 500, 1000, 10000];

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Donating:', amount);
        // Add payment logic here
        onClose();
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
                        <div className="w-16 h-16 mb-4 bg-black text-white rounded-2xl flex items-center justify-center">
                            <FaHeart className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-black tracking-tight">Enter Amount</h2>
                        <p className="mt-1 text-gray-500 font-medium">Support our general fund directly</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-black group-focus-within:text-black transition-colors">
                                ₹
                            </div>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-10 pr-5 py-5 bg-gray-200 border-2 border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all duration-200 text-2xl font-bold placeholder:text-gray-400 appearance-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
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
                            className="w-full py-5 bg-black text-white rounded-2xl font-bold hover:bg-gray-900 transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-black/20 transform hover:-translate-y-0.5"
                        >
                            Donate Now
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
