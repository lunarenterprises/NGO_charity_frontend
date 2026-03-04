import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';

const AdminProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    // Render the dashboard/admin content
    return <Outlet />;
};

export default AdminProtectedRoute;
