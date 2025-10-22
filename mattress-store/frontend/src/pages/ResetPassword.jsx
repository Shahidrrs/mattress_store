import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // CORRECTED PATH

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth(); // Get the resetPassword function from context

  // Extract the token from the URL: /auth?mode=reset&token=...
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!token) {
      setMessage({ type: "error", text: "Password reset token is missing or invalid." });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (password.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters long." });
      return;
    }

    setLoading(true);
    try {
      // Pass the token and the new password to the API call
      const successMessage = await resetPassword(token, password);
      
      // On success: show message and redirect to login after a delay
      setMessage({ type: "success", text: successMessage });
      setTimeout(() => {
        navigate("/auth"); // Navigate back to the login page
      }, 3000);
      
    } catch (error) {
      // Error message is already set by useAuth on failure
      setMessage({ type: "error", text: error.message || "Failed to reset password." });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h2>
        <p className="text-gray-600">This password reset link is invalid or has expired. Please request a new one.</p>
        <button 
          onClick={() => navigate('/auth?mode=forgot')}
          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-150"
        >
          Request New Link
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-2xl rounded-xl border border-gray-200">
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Set New Password</h2>
      <p className="text-center text-sm text-gray-500 mb-6">Enter and confirm your new password below.</p>

      {/* Message Display */}
      {message && (
        <div 
          className={`p-3 mb-4 rounded-lg text-sm font-medium ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
            New Password (min 8 chars)
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !password || !confirmPassword}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white transition duration-200 ${
            loading || !password || !confirmPassword
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;