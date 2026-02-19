import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import QuickDonationModal from '../Components/QuickDonationModal';
import Footer from '../Components/Footer';

const UserLayout = ({ isQuickDonationOpen, setIsQuickDonationOpen }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar onQuickDonationOpen={() => setIsQuickDonationOpen(true)} />
            <main className="grow">
                <Outlet />
            </main>
            <Footer onQuickDonationOpen={() => setIsQuickDonationOpen(true)} />
            {isQuickDonationOpen && (
                <QuickDonationModal onClose={() => setIsQuickDonationOpen(false)} />
            )}
        </div>
    );
};

export default UserLayout;
