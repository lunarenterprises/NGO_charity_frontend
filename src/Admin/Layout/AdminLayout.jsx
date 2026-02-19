import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../Components/AdminSidebar';
import { HiMenuAlt2 } from 'react-icons/hi';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-50 rounded-md transition-colors"
                        >
                            <HiMenuAlt2 className="w-6 h-6 text-black" />
                        </button>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                            Overview
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-xs font-bold text-black uppercase">Jithin PM</span>
                            <span className="text-[10px] text-gray-400 font-medium">Administrator</span>
                        </div>
                        <div className="w-9 h-9 rounded bg-black flex items-center justify-center text-white text-xs font-bold">
                            JP
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50/30 p-4 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
