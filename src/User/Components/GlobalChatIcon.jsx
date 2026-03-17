import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { PiChatCircleDotsBold, PiWhatsappLogoBold } from 'react-icons/pi';
import { useAuth } from '../../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GlobalChatIcon = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated) return null;

    return (
        <div className="fixed top-1/2 -translate-y-1/2 right-0 z-50 flex items-center">
            
            {/* The Chat Panel (Slides out from the right) */}
            <div 
                className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform origin-right ${
                    isOpen 
                        ? 'translate-x-0 opacity-100 mr-4' 
                        : 'translate-x-[110%] opacity-0 mr-0 pointer-events-none'
                }`}
            >
                <div className="bg-white/95 backdrop-blur-xl w-[320px] rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white flex flex-col overflow-hidden relative group">
                    
                    <div className="absolute inset-0 bg-linear-to-b from-gray-50/50 to-transparent pointer-events-none"></div>

                    {/* Header */}
                    <div className="p-6 pb-4 flex justify-between items-start relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse hidden"></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Support</span>
                            </div>
                            <h3 className="font-black text-2xl tracking-tight text-gray-900">How can we <br/>help you?</h3>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors group/close"
                        >
                            <IoClose className="w-5 h-5 group-hover/close:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 pt-2 relative z-10 flex-col gap-3 flex">
                        <p className="text-gray-500 text-sm leading-relaxed mb-4">
                            Have questions about our projects or need to know more or any doubt ? Chat with our team.
                        </p>
                        
                        <button
                            onClick={() => { setIsOpen(false); navigate('/chat'); }}
                            className="w-full relative overflow-hidden group/btn bg-gray-50 p-4 rounded-2xl flex items-center justify-between transition-colors border-2 border-gray-200 cursor-pointer text-left"
                        >
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center transition-transform">
                                    <PiChatCircleDotsBold className="w-6 h-6" />
                                </div>
                                <div className="text-left gap-0">
                                    <span className="block font-bold text-sm text-gray-900">Chat to Official</span>
                                    <span className="block text-[11px] font-medium opacity-70">Usually replies instantly</span>
                                </div>
                            </div>
                        </button>
                        
                        
                    </div>
                </div>
            </div>

            {/* The Trigger Tab (Classy Vertical side tab) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`absolute right-[-12px] hover:right-0 top-1/2 -translate-y-1/2 flex items-center shadow-[0_0_30px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out group ${
                    isOpen ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
                }`}
                aria-label="Toggle chat"
            >
                {/* The side tab itself */}
                <div className="bg-black text-white pl-2.5 pr-[18px] py-6 rounded-l-2xl flex flex-col items-center gap-3 border border-r-0 border-gray-800">
                     <span className="writing-vertical rotate-180 uppercase tracking-[0.3em] font-black text-[10px] text-gray-300 group-hover:text-white transition-colors" style={{ writingMode: 'vertical-rl' }}>
                         Help
                     </span>
                     <PiChatCircleDotsBold className="w-6 h-6 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all text-white" />
                </div>
            </button>
        </div>
    );
};

export default GlobalChatIcon;
