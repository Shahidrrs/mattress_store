import axios from 'axios';

// Set the deployed backend URL (based on your Render backend service)
const deployedUrl = 'https://mattress-store-ig3e.onrender.com';

// Determine the environment: 
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Create a configured Axios instance
const api = axios.create({
    // BaseURL is clean (no /api), as we fixed previously.
    baseURL: isLocal 
        ? 'http://localhost:5000' // Local environment
        : `${deployedUrl}`,        // Deployed environment

    // IMPORTANT: Ensure cookies/sessions are sent with every request
    withCredentials: true,
});

// --- CRITICAL FIX: AXIOS REQUEST INTERCEPTOR ---
// This function runs before every request is sent.
api.interceptors.request.use(
    (config) => {
        // 1. Retrieve the token from localStorage
        const token = localStorage.getItem('token');
        
        // 2. If a token exists, add it to the Authorization header
        if (token) {
            // Standard JWT token format: Bearer <token>
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        // Handle request error (e.g., network issues)
        return Promise.reject(error);
    }
);
// --- END INTERCEPTOR ---

export default api;
