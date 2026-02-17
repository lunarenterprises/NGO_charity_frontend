import React from 'react';
import ReactDOM from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { FaHeart, FaHandsHelping } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DonationTypeModal = ({ onClose, onQuickDonation }) => {
    const navigate = useNavigate();
    const portalRoot = document.body;

    const options = [
        {
            id: 'quick',
            title: 'Quick Donation',
            description: 'Make a fast contribution to our general fund to support urgent needs.',
            icon: <FaHeart className="w-6 h-6" />,
            action: () => {
                onClose();
                onQuickDonation();
            }
        },
        {
            id: 'project',
            title: 'Donate on a Project',
            description: 'Choose a specific cause or project you want to support directly.',
            icon: <FaHandsHelping className="w-6 h-6" />,
            action: () => {
                onClose();
                navigate('/active-projects');
            }
        }
    ];

    const modalContent = (
        <div className="fixed inset-0 z-100 grid place-items-center p-4 bg-black/20 backdrop-blur-[5px] animate-in fade-in duration-300">
            <div
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all duration-200 z-10"
                >
                    <IoClose className="w-6 h-6" />
                </button>

                <div className="p-8 md:p-12">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-black tracking-tight">How would you like to help?</h2>
                        <p className="mt-2 text-gray-500 font-medium">Choose a donation method that suits you best</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {options.map((option) => (
                            <button
                                key={option.id}
                                onClick={option.action}
                                className="group flex flex-col items-center text-center p-8 bg-gray-100  hover:bg-black  hover:border-black rounded-3xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10"
                            >
                                <div className="w-16 h-16 mb-6 bg-black text-white group-hover:bg-white group-hover:text-black rounded-2xl flex items-center justify-center transition-colors duration-300">
                                    {option.icon}
                                </div>
                                <h3 className="text-xl font-bold text-black group-hover:text-white mb-3 transition-colors duration-300">
                                    {option.title}
                                </h3>
                                <p className="text-sm text-gray-500 group-hover:text-gray-400 leading-relaxed font-medium transition-colors duration-300 text-center">
                                    {option.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Overlay background click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );

    return ReactDOM.createPortal(modalContent, portalRoot);
};

export default DonationTypeModal;
