import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios'; 

// --- Configuration: Dynamic URL FIX (Using relative path for deployed) ---
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// If running locally, use localhost:5000.
// If deployed (not local), use the relative path '/api'. 
// Render's Rewrite Rule must be configured to forward this to the backend service URL.
const API_ROOT_URL = isLocal 
    ? 'http://localhost:5000' 
    : ''; // Use empty string to create a path like /api/auth/login

const API_BASE_URL = `${API_ROOT_URL}/api/auth`; 

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
            // This will call /api/auth/forgot-password on deployed site
            const response = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
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
            // This will call /api/auth/reset-password on deployed site
            const response = await axios.post(`${API_BASE_URL}/reset-password`, { 
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
