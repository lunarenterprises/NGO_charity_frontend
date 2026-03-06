import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import QuickDonationModal from '../Components/QuickDonationModal';
import Footer from '../Components/Footer';

const UserLayout = ({ isQuickDonationOpen, setIsQuickDonationOpen }) => {
    const location = useLocation();
    const isSuccessPage = location.pathname === '/payment-success';

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar onQuickDonationOpen={() => setIsQuickDonationOpen(true)} />
            <main className="grow">
                <Outlet />
            </main>
            {!isSuccessPage && <Footer onQuickDonationOpen={() => setIsQuickDonationOpen(true)} />}
            {isQuickDonationOpen && (
                <QuickDonationModal onClose={() => setIsQuickDonationOpen(false)} />
            )}
        </div>
    );
};

export default UserLayout;
