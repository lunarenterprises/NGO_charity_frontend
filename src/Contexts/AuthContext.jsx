import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [userAuth, setUserAuth] = useState({ user: null, accessToken: null, refreshToken: null });
    const [adminAuth, setAdminAuth] = useState({ user: null, accessToken: null, refreshToken: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sync with localStorage on mount
        const storedUser = localStorage.getItem("user");
        const storedAdmin = localStorage.getItem("admin");

        if (storedUser && storedUser !== "undefined") {
            try {
                const parsed = JSON.parse(storedUser);
                // Handle legacy format where 'user' was just the user object
                if (parsed.accessToken) {
                    setUserAuth(parsed);
                } else {
                    setUserAuth({
                        user: parsed,
                        accessToken: localStorage.getItem("accessToken"),
                        refreshToken: localStorage.getItem("refreshToken")
                    });
                }
            } catch (e) {
                console.error("AuthContext: Error parsing user from localStorage", e);
            }
        }

        if (storedAdmin && storedAdmin !== "undefined") {
            try {
                const parsed = JSON.parse(storedAdmin);
                setAdminAuth(parsed);
            } catch (e) {
                console.error("AuthContext: Error parsing admin from localStorage", e);
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, tokens, role = 'user') => {
        const authData = {
            user: userData,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken || null
        };

        if (role === 'admin') {
            setAdminAuth(authData);
            localStorage.setItem("admin", JSON.stringify(authData));
        } else {
            setUserAuth(authData);
            localStorage.setItem("user", JSON.stringify(authData));
        }
        
        // Cleanup legacy keys to avoid confusion
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    };

    const logout = (role = 'user') => {
        if (role === 'admin') {
            setAdminAuth({ user: null, accessToken: null, refreshToken: null });
            localStorage.removeItem("admin");
        } else {
            setUserAuth({ user: null, accessToken: null, refreshToken: null });
            localStorage.removeItem("user");
        }
        sessionStorage.clear();
    };

    const updateAuthData = (newData, role = 'user') => {
        if (role === 'admin') {
            setAdminAuth(prev => {
                const updated = { ...prev, ...newData };
                localStorage.setItem("admin", JSON.stringify(updated));
                return updated;
            });
        } else {
            setUserAuth(prev => {
                const updated = { ...prev, ...newData };
                localStorage.setItem("user", JSON.stringify(updated));
                return updated;
            });
        }
    };

    return (
        <AuthContext.Provider value={{
            // User-side exports
            user: userAuth.user,
            accessToken: userAuth.accessToken,
            refreshToken: userAuth.refreshToken,
            isAuthenticated: !!userAuth.accessToken,
            
            // Admin-side exports
            adminStatus: adminAuth.user,
            adminAccessToken: adminAuth.accessToken,
            isAdminAuthenticated: !!adminAuth.accessToken,
            
            login,
            logout,
            updateAuthData,
            loading
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
