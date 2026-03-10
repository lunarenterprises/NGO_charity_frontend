import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import QuickDonationModal from '../Components/QuickDonationModal';
import Footer from '../Components/Footer';
import LoginPopup from '../Components/LoginPopup';

const UserLayout = ({ isQuickDonationOpen, setIsQuickDonationOpen }) => {
    const [isLoginPopupOpen, setIsLoginPopupOpen] = React.useState(false);
    const location = useLocation();
    const isSuccessPage = location.pathname === '/payment-success';

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar onQuickDonationOpen={() => setIsQuickDonationOpen(true)} />
            <main className="grow">
                <Outlet context={{ onRequireLogin: () => setIsLoginPopupOpen(true) }} />
            </main>
            {!isSuccessPage && <Footer onQuickDonationOpen={() => setIsQuickDonationOpen(true)} />}
            {isQuickDonationOpen && (
                <QuickDonationModal onClose={() => setIsQuickDonationOpen(false)} />
            )}
            {isLoginPopupOpen && <LoginPopup onClose={() => setIsLoginPopupOpen(false)} />}
        </div>
    );
};

export default UserLayout;
