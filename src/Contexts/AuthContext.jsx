import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sync with localStorage on mount
        const storedUser = localStorage.getItem("user");
        const storedAccessToken = localStorage.getItem("accessToken");
        const storedRefreshToken = localStorage.getItem("refreshToken");

        if (storedUser && storedUser !== "undefined") {
            try {
                setUser(JSON.parse(storedUser));
                setAccessToken(storedAccessToken);
                setRefreshToken(storedRefreshToken);
            } catch (e) {
                console.error("AuthContext: Error parsing user from localStorage", e);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, tokens) => {
        // Atomic update of state and localStorage
        setUser(userData);
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("accessToken", tokens.accessToken);
        if (tokens.refreshToken) {
            localStorage.setItem("refreshToken", tokens.refreshToken);
        }
    };

    const logout = () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // Clear all session storage if used
        sessionStorage.clear();
    };

    const updateAccessToken = (newToken) => {
        setAccessToken(newToken);
        localStorage.setItem("accessToken", newToken);
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{
            user,
            accessToken,
            refreshToken,
            isAuthenticated: !!accessToken,
            login,
            logout,
            updateAccessToken,
            updateUser,
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
