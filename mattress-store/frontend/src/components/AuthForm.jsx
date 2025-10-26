import { useState, useEffect, useContext } from "react"; 
import { CartContext } from '../context/CartContext.jsx'; 
import api from '../utils/api.js'; // NEW: Import the centralized API utility

// This component is rendered inside a modal and handles all authentication flows.
export default function AuthForm({ onAuthSuccess }) { 
  // Get user and login/logout functions from context
  const { user, login, logout } = useContext(CartContext); 
  
  const [mode, setMode] = useState("login"); // 'login', 'signup', 'forgot', or 'reset'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(""); // Holds the token for the reset step
  const [newPassword, setNewPassword] = useState("");


const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    let endpoint, payload;

    // 1. Determine the correct relative endpoint and payload
    if (mode === 'login' || mode === 'signup') {
      // FIX: Added /api prefix to the endpoint
      endpoint = `/api/auth/${mode}`; 
      payload = mode === 'login' ? { email, password } : { name, email, password };
    } else if (mode === 'forgot') {
      // FIX: Added /api prefix to the endpoint
      endpoint = `/api/auth/forgot-password`;
      payload = { email };
    } else if (mode === 'reset') {
      // FIX: Added /api prefix to the endpoint
      endpoint = `/api/auth/reset-password`;
      payload = { token: resetToken, newPassword };
    } else {
        setLoading(false);
        return;
    }

    try {
      // 2. Use the 'api' utility (Axios) for the network request
      const res = await api.post(endpoint, payload); // Use api.post for all auth flows
      const data = res.data; // Axios stores response body in .data

      // Note: Axios throws an error for 4xx/5xx status codes, so we only handle res.ok (2xx) here.

      if (data.token) {
        // Successful Login/Signup
        localStorage.setItem("token", data.token);
        login(data.user); 

        setEmail("");
        setPassword("");
        setName("");
        setMessage("Login successful! Closing in 1 second...");
        
        setTimeout(() => {
          onAuthSuccess?.(); 
        }, 1000);

      } else if (mode === 'forgot') {
        // Forgot Password initiation successful
        setMessage(data.message);
        
        // --- DEVELOPMENT HACK: Auto-move to reset mode using the debug token ---
        if (data.debugToken) {
          setResetToken(data.debugToken);
          setMode('reset');
          setEmail("");
          setMessage("Token received (for dev). Enter your new password.");
        }
        // ----------------------------------------------------------------------

      } else if (mode === 'reset') {
        // Password Reset successful
        setMessage(data.message + " Redirecting to login...");
        setTimeout(() => {
            setMessage("");
            setMode('login');
        }, 3000);
        
      } else {
        // Should be unreachable with standard 200 responses, but safe to include
        setMessage(data.message || "An unexpected error occurred.");
      }
    } catch (err) {
      // Axios error handling: err.response exists for 4xx/5xx errors
      console.error("Authentication request failed:", err);
      const errorMsg = err.response?.data?.message || err.message || "Request failed. Check server status.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    // Already logged in - showing dashboard view inside the modal
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-50 rounded-xl shadow-inner text-center">
        <h2 className="2xl font-semibold mb-2 text-gray-800">Welcome, {user.name}!</h2>
        <p className="text-gray-600 mb-4">You are successfully logged in.</p>
        <button 
          onClick={logout} // Use context's logout function
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }
  
  // Auth Form View (Login, Signup, Forgot, Reset)
  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';
  const isForgot = mode === 'forgot';
  const isReset = mode === 'reset';

  const title = isLogin ? "Login" : isSignup ? "Create Account" : isForgot ? "Forgot Password" : "Reset Password";
  const buttonText = isLogin ? "Login" : isSignup ? "Signup" : isForgot ? "Send Reset Link" : "Set New Password";

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-800">{title}</h2>
      
      {message && (
          <div className={`p-3 mb-4 rounded-lg text-sm font-medium ${message.includes("successful") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
          </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {isSignup && (
          <input 
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        )}
        
        {(!isReset) && ( // Email required for login, signup, and forgot
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
        )}
        
        {(isLogin || isSignup) && (
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        )}

        {isReset && (
            <>
              <input 
                  type="password" 
                  placeholder="New Password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-[-8px]">
                  *For development: Token is auto-applied to proceed to reset.
              </p>
            </>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? "Processing..." : buttonText}
        </button>
      </form>

      {/* Mode Switching Links */}
      <p className="mt-6 text-center text-gray-600 text-sm">
        {isLogin && (
            <>
              <span 
                  className="text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors mr-3" 
                  onClick={() => { setMode('forgot'); setEmail(''); setMessage(''); }}
              >
                  Forgot Password?
              </span>
              <span onClick={() => { setMode('signup'); setEmail(''); setMessage(''); }} className="text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors">
                  Create an account
              </span>
            </>
        )}
        {(isSignup || isForgot || isReset) && (
            <>
              <span 
                  onClick={() => { setMode('login'); setEmail(''); setMessage(''); }} 
                  className="text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
              >
                  Back to Login
              </span>
            </>
        )}
      </p>
    </div>
  );
}
