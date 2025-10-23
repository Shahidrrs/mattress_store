import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios'; 

// --- Configuration: Dynamic URL FIX ---
// 1. Check if the environment is a local development server
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// 2. Set the base URL dynamically:
// If local, use the local backend port 5000.
// If deployed, use the full deployed backend URL.
const API_ROOT_URL = isLocal 
    ? 'http://localhost:5000' 
    : 'https://mattress-store-ig3e.onrender.com'; // **CRITICAL: Use your specific deployed backend URL here**

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
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('token', 'fake_auth_token_for_testing');
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
    };

    // --- Forgot Password Logic (Existing) ---
    const forgotPassword = async (email) => {
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
            return response.data.message || 'Password reset link sent to your email!';
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Error processing request. Failed to connect to server.";
            setError(errorMessage);
            throw new Error(errorMessage); 
        }
    };

    // --- NEW: Reset Password Logic ---
    const resetPassword = async (token, newPassword) => {
        setError(null);
        try {
            // API call to http://localhost:5000/api/auth/reset-password (or deployed equivalent)
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