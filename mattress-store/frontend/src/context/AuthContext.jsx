import React, { createContext, useState, useEffect, useContext } from 'react';
// REMOVED: import axios from 'axios';
// NEW: Import the centralized API utility for all network calls
import api from '../utils/api.js'; 

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
        // NOTE: Actual login API call logic should be implemented here later
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('token', 'fake_auth_token_for_testing');
    };

    const logout = () => {
        // NOTE: Actual logout API call logic should be implemented here later
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
    };

    // --- Forgot Password Logic ---
    const forgotPassword = async (email) => {
        setError(null);
        setLoading(true); // Added loading state
        try {
            // Use the centralized 'api' instance, path is relative to the base URL (e.g., /api)
            const response = await api.post(`/auth/forgot-password`, { email });
            return response.data.message || 'Password reset link sent to your email!';
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Error processing request. Failed to connect to server.";
            setError(errorMessage);
            throw new Error(errorMessage); 
        } finally {
            setLoading(false);
        }
    };

    // --- Reset Password Logic ---
    const resetPassword = async (token, newPassword) => {
        setError(null);
        setLoading(true); // Added loading state
        try {
            // Use the centralized 'api' instance, path is relative to the base URL (e.g., /api)
            const response = await api.post(`/auth/reset-password`, { 
                token, 
                newPassword 
            });
            return response.data.message || 'Password successfully reset.';
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to reset password. Link may be invalid or expired.";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    // ---------------------------------

    useEffect(() => {
        // You might add initial authentication check logic here later
        setLoading(false);
    }, []);

    const contextValue = { 
        isAuthenticated, 
        user, 
        login, 
        logout, 
        loading, // Include loading state
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
