import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import QuickDonationModal from '../Components/QuickDonationModal';
import DonationTypeModal from '../Components/DonationTypeModal';
import Footer from '../Components/Footer';
import LoginPopup from '../Components/LoginPopup';
import GlobalChatIcon from '../Components/GlobalChatIcon';

const UserLayout = ({ isQuickDonationOpen, setIsQuickDonationOpen }) => {
    const [isLoginPopupOpen, setIsLoginPopupOpen] = React.useState(false);
    const [isDonationTypeModalOpen, setIsDonationTypeModalOpen] = React.useState(false);
    const location = useLocation();
    const isSuccessPage = location.pathname === '/payment-success';

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar 
                onDonationOpen={() => setIsDonationTypeModalOpen(true)}
                onQuickDonationOpen={() => setIsQuickDonationOpen(true)} 
            />
            <main className="grow">
                <Outlet context={{ onRequireLogin: () => setIsLoginPopupOpen(true) }} />
            </main>
            {!isSuccessPage && (
                <Footer onDonationOpen={() => setIsDonationTypeModalOpen(true)} />
            )}
            {isQuickDonationOpen && (
                <QuickDonationModal onClose={() => setIsQuickDonationOpen(false)} />
            )}
            {isDonationTypeModalOpen && (
                <DonationTypeModal 
                    onClose={() => setIsDonationTypeModalOpen(false)}
                    onQuickDonation={() => setIsQuickDonationOpen(true)}
                    onRequireLogin={() => {
                        setIsDonationTypeModalOpen(false);
                        setIsLoginPopupOpen(true);
                    }}
                />
            )}
            {isLoginPopupOpen && <LoginPopup onClose={() => setIsLoginPopupOpen(false)} />}
            <GlobalChatIcon />
        </div>
    );
};

export default UserLayout;
