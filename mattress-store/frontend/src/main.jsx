import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import axios from 'axios'; // <-- CRITICAL: Axios import is needed here

// --- GLOBAL AXIOS BASE URL CONFIGURATION ---
// The URL below is derived from your previous conversation.
const deployedUrl = 'https://mattress-store-ig3e.onrender.com';

// 1. Determine the environment
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// 2. Set the global default base URL for ALL subsequent Axios calls.
// This ensures that all calls like 'axios.get("/products")' go to the correct backend.
axios.defaults.baseURL = isLocal 
    ? 'http://localhost:5000/api' 
    : `${deployedUrl}/api`; 

// 3. Ensure credentials are included globally for cookies/sessions
axios.defaults.withCredentials = true; 
// --- END GLOBAL CONFIGURATION ---

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
