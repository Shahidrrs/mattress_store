import React, { useState, useEffect } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom"; // <-- ADDED useSearchParams
import Home from "./pages/Home.jsx"; // <-- ADDED .jsx
import Shop from "./pages/Shop.jsx"; // <-- ADDED .jsx
import Cart from "./pages/Cart.jsx"; // <-- ADDED .jsx
import Checkout from "./pages/Checkout.jsx"; // <-- ADDED .jsx
import Confirmation from "./pages/Confirmation.jsx"; // <-- ADDED .jsx
import OrderHistory from "./components/OrderHistory.jsx"; // <-- ADDED .jsx
import ProductDetail from "./components/ProductDetail.jsx"; // <-- ADDED .jsx
import { CartProvider } from "./context/CartContext.jsx"; // <-- ADDED .jsx
import { AuthProvider } from "./context/AuthContext.jsx"; // <-- ADDED .jsx
import Header from "./components/Header.jsx"; // <-- ADDED .jsx
import AuthForm from "./components/AuthForm.jsx"; // <-- ADDED .jsx
import ResetPassword from "./pages/ResetPassword.jsx"; // <-- ADDED .jsx
import OrderDetail from "./pages/OrderDetail.jsx"; // <-- ADDED .jsx

// --- New Component to handle /auth?mode=... logic ---
const AuthHandler = () => {
    // Hooks to read the query parameters from the URL
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode');

    // If the URL is /auth?mode=reset, render the ResetPassword form
    // This is triggered by the link in your email.
    if (mode === 'reset') {
        return <ResetPassword />; 
    }
    
    // Otherwise, render the standard AuthForm (for login or signup)
    // You can pass the mode to AuthForm if it handles both login/signup.
    return <AuthForm mode={mode || 'login'} />; 
};
// ---------------------------------------------------

export default function App() {
  // Keeping this local user state for initial setup, but CartProvider is the 
  // centralized source of truth for user data and logic.
  const [user, setUser] = useState(null); 

  // Load user from localStorage on mount (Kept for initial check)
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  return (
    <AuthProvider> {/* Ensure AuthProvider wraps everything that uses context */}
        <CartProvider> 
            <div className="min-h-screen bg-gray-50 font-sans">
                <Header /> 
                <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"> 
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/history" element={<OrderHistory />} /> 
                        <Route path="/confirmation" element={<Confirmation />} /> 
                        <Route path="/shop/:slug" element={<ProductDetail />} />
                        
                        {/* CHANGED ROUTE: Now catches /auth and uses the handler */}
                        {/* This will render AuthHandler for /auth?mode=reset, /auth?mode=login, etc. */}
                        <Route path="/auth" element={<AuthHandler />} /> 

                        
                        <Route path="/orders/:orderId" element={<OrderDetail />} />
                        {/* Or if you need a static path for testing: */}
                        <Route path="/order/123" element={<OrderDetail />} />
                        
                    </Routes>
                </main>
            </div>
        </CartProvider>
    </AuthProvider>
  );
}
