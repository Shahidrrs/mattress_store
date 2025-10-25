import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api'; // NEW: Import the centralized Axios instance

// --- Context Definition ---
export const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    login: () => {},
    logout: () => {},
    loading: true,
    error: null,
    forgotPassword: () => Promise.reject('Not implemented'), 
    resetPassword: () => Promise.reject('Not implemented'),
});

export const useAuth = () => useContext(AuthContext);

// --- Provider Component ---
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Placeholder login/logout logic...
    const login = (userData) => {
        // ... (login logic)
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('token', 'fake_auth_token_for_testing');
    };

    const logout = () => {
        // ... (logout logic)
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
    };

    // --- Forgot Password Logic ---
    const forgotPassword = async (email) => {
        setError(null);
        try {
            // Use the centralized api instance for all calls
            const response = await api.post(`/auth/forgot-password`, { email });
            return response.data.message || 'Password reset link sent to your email!';
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Error processing request. Failed to connect to server.";
            setError(errorMessage);
            throw new Error(errorMessage); 
        }
    };

    // --- Reset Password Logic ---
    const resetPassword = async (token, newPassword) => {
        setError(null);
        try {
            // Use the centralized api instance for all calls
            const response = await api.post(`/auth/reset-password`, { 
                token, 
                newPassword 
            });
            return response.data.message || 'Password successfully reset.';
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to reset password. Link may be invalid or expired.";
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };
    // ---------------------------------

    useEffect(() => {
        setLoading(false);
    }, []);

    const contextValue = { 
        isAuthenticated, 
        user, 
        login, 
        logout, 
        loading,
        error, 
        forgotPassword,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
