import axios from 'axios';

// Get the base URL from the browser's current location, checking for both localhost and 127.0.0.1
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// If running locally, use the local backend.
// If deployed, use the absolute HTTPS URL of the deployed backend.
const API_ROOT_URL = isLocal 
    ? 'http://localhost:5000' 
    : 'https://mattress-store-ig3e.onrender.com'; // **YOUR DEPLOYED BACKEND URL**

// Create a single Axios instance for the entire application
const api = axios.create({
    baseURL: `${API_ROOT_URL}/api`,
    withCredentials: true, // This ensures cookies/sessions are sent
    // We can add global headers here if needed
});

export default api;
