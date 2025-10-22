import React, { useContext, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext'; // Removed .jsx
import AuthForm from "./AuthForm"; // Removed .jsx

// Define the new categories
const CATEGORIES = [
  "Prayer Mat",
  "Tasbeeh",
  "Digital Tasbeeh Counter",
  "Attar & Perfume",
  "Quran Box",
  "Imama Sharif",
  "Haji Rumal"
];

// CRITICAL FIX: Removed props and accessed user and logout from context
export default function Header() { 
  // Get cart, user, and the global logout function from context
  const { cart, user, logout } = useContext(CartContext);
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const isAdmin = user?.isAdmin; // Safely check for admin status

  const [showAuth, setShowAuth] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Helper to convert category name to URL slug (This is fine as is)
  const categoryToSlug = (category) => encodeURIComponent(category.replace(/ /g, '-').toLowerCase());

  return (
    <>
      {/* --- Fixed Header Bar --- */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-white shadow-lg border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
          {/* Logo / Brand Name */}
          <Link to="/" className="text-2xl md:text-3xl font-extrabold text-indigo-700 tracking-tight flex items-center gap-2 transition-colors duration-200 hover:text-indigo-500">
            <span className="text-xl">🕌</span> 
            The Sacred Store
          </Link>

          {/* Navigation Links and Actions */}
          <nav className="flex items-center space-x-2 md:space-x-4">
            
            {/* Shop Link with Dropdown */}
            <div 
              className="relative hidden sm:block" 
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
              ref={dropdownRef}
            >
              <Link 
                to="/shop" 
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <span className="text-xl">🛍️</span> Shop & Categories
              </Link>
              
              {isDropdownOpen && (
                <div 
                  className="absolute top-full mt-2 w-60 bg-white rounded-lg shadow-xl py-2 z-30 border border-gray-100"
                >
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat}
                      to={`/shop?category=${encodeURIComponent(cat)}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Link with Badge */}
            <Link 
              to="/cart" 
              className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-700">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>

              {count > 0 && (
                <span 
                  className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full"
                >
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>

            {/* Auth / User Section - Conditional Rendering */}
            {user ? (
              <div className="flex items-center space-x-2">
                
                {/* Admin Orders Link (Only for Admin) */}
                {isAdmin && (
                  <Link 
                    to="/admin/orders" 
                    className="hidden lg:flex items-center gap-1 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors duration-200"
                  >
                    Admin
                  </Link>
                )}
                
                {/* Orders History Link - UPDATED ROUTE TO /history */}
                <Link 
                  to="/history" // Changed from /orders to /history
                  className="hidden md:flex items-center gap-1 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                >
                  My Orders
                </Link>

                {/* Logout Button */}
                <button 
                  onClick={logout} // Call context's logout function
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md"
                >
                  <span className="text-sm">👋</span> 
                  Logout
                </button>
              </div>
            ) : (
              // Login/Signup Button (When not logged in)
              <button 
                onClick={() => setShowAuth(true)} 
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md"
              >
                <span className="text-sm">👤</span> 
                Login / Register
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Since the header is fixed, we need padding on the main content */}
      <div className="pt-16">
        {/* This div is the padding buffer for the fixed header */}
      </div>

      {/* --- Modal for AuthForm --- */}
      {showAuth && !user && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          onClick={() => setShowAuth(false)} 
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 relative max-w-sm w-full"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* onAuthSuccess is triggered when the user logs in or registers */}
            <AuthForm onAuthSuccess={() => setShowAuth(false)} /> 
            <button 
              onClick={() => setShowAuth(false)} 
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 transition-colors text-2xl"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
