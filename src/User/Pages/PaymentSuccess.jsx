import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import QuickDonationSuccess from '../Components/QuickDonationSuccess';
import ProjectDonationSuccess from '../Components/ProjectDonationSuccess';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { amount, transactionId, projectTitle } = location.state || {};

    useEffect(() => {
        if (!location.state) {
            const timer = setTimeout(() => navigate('/'), 5000);
            return () => clearTimeout(timer);
        }
    }, [location.state, navigate]);

    if (!location.state) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-6"></div>
                <h1 className="text-2xl font-bold mb-2">Processing transaction...</h1>
                <p className="text-gray-500 mb-8 font-medium">If you aren't redirected, please click below.</p>
                <Link to="/" className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg">
                    Go to Home
                </Link>
            </div>
        );
    }

    if (projectTitle) {
        return (
            <ProjectDonationSuccess
                amount={amount}
                transactionId={transactionId}
                projectTitle={projectTitle}
            />
        );
    }

    return (
        <QuickDonationSuccess
            amount={amount}
            transactionId={transactionId}
        />
    );
};

export default PaymentSuccess;
