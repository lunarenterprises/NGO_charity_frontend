import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    HiOutlineViewGrid,
    HiOutlineHeart,
    HiOutlineCash,
    HiOutlineUserGroup,
    HiOutlineCog,
    HiOutlineLogout,
    HiOutlineClipboardCheck,
    HiOutlineSwitchHorizontal,
    HiOutlineQuestionMarkCircle,
    HiX
} from 'react-icons/hi';

const AdminSidebar = ({ isOpen, onClose }) => {
    const menuItems = [
        { title: 'Dashboard', path: '/admin', icon: <HiOutlineViewGrid className="w-5 h-5" /> },
        { title: 'Active Projects', path: '/admin/active-projects', icon: <HiOutlineHeart className="w-5 h-5" /> },
        { title: 'Completed Projects', path: '/admin/completed-projects', icon: <HiOutlineClipboardCheck className="w-5 h-5" /> },
        { title: 'Recent Transactions', path: '/admin/recent-transactions', icon: <HiOutlineSwitchHorizontal className="w-5 h-5" /> },
        { title: 'Enquiries', path: '/admin/enquiries', icon: <HiOutlineQuestionMarkCircle className="w-5 h-5" /> },
        { title: 'Users', path: '/admin/users', icon: <HiOutlineUserGroup className="w-5 h-5" /> },
        { title: 'Banner Settings', path: '/admin/banner-settings', icon: <HiOutlineCog className="w-5 h-5" /> },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-gray-800 transition-transform duration-300 transform
        lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-900">
                        <h1 className="text-lg font-bold tracking-tight text-white uppercase">NGO Admin</h1>
                        <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-800 rounded">
                            <HiX className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/admin'}
                                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? 'bg-white text-black'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-900'
                                    }`
                                }
                            >
                                {item.icon}
                                <span className="ml-3">{item.title}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-900">
                        <button className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-900 rounded-md transition-colors">
                            <HiOutlineLogout className="w-5 h-5" />
                            <span className="ml-3">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
