import React, { createContext, useState, useEffect } from "react";
// NEW: Import the centralized API utility
// CORRECTED PATH: Using '../../utils/api.js' based on previous successful resolution.
import api from '../utils/api.js'; 

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  // NOTE: The user state, login, and logout functions in CartContext are redundant 
  // if AuthContext is present. We keep them for now, but integration with AuthContext 
  // should be considered later to avoid state duplication.
  const [user, setUser] = useState(null); 
  // NEW: Holds data for the last completed order before showing confirmation screen
  const [lastOrder, setLastOrder] = useState(null); 

  // --- User Authentication & State Management ---

  const initializeUser = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Error initializing user state:", e);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("cart"); 
    setUser(null);
    setCart([]); // Clear cart state on logout
    setLastOrder(null); // Clear any pending order data
  };

  // Effect to load user state ONCE on component mount
  useEffect(() => {
    initializeUser();
  }, []);

  // --- Cart Management (Syncs with Backend via API Utility) ---

  const fetchCart = async () => {
    // No token check needed here, the centralized api utility handles token injection.
    // We only check if a user object exists to decide between API or localStorage.

    if (!user) {
      // Guest cart from localStorage
      const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCart(guestCart);
      return;
    }

    // Logged-in user: fetch cart from backend
    try {
      // REPLACED: fetch("http://localhost:5000/api/cart", ...)
      // Use api.get, the base URL and Authorization header are handled centrally.
      const response = await api.get("/api/cart"); 
      
      // The backend response is expected to be { items: [...] }
      const backendCart = response.data.items?.map((item) => ({
        // Assuming product data is nested under item.product
        productId: item.product._id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
      })) || [];
          
      setCart(backendCart);
      localStorage.setItem("cart", JSON.stringify(backendCart));
    } catch (err) {
      console.error("Failed to fetch cart:", err.message);
    }
  };

  useEffect(() => {
    // Re-fetch cart whenever the user state changes (login/logout)
    fetchCart();
  }, [user]); 

  const addToCart = async (product, qty = 1) => {
    // Update local state immediately for fast UI feedback
    setCart((prev) => {
      const exist = prev.find((i) => i.productId === product._id);
      let updatedCart;
      if (exist) {
        updatedCart = prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + qty } : i
        );
      } else {
        updatedCart = [
          ...prev,
          { productId: product._id, title: product.title, price: product.price, quantity: qty },
        ];
      }
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });

    // Only sync with backend if a user is logged in (token exists)
    if (localStorage.getItem("token")) {
      try {
        // REPLACED: fetch("http://localhost:5000/api/cart/add", ...)
        await api.post("/api/cart/add", { productId: product._id, quantity: qty });
      } catch (err) {
        console.error("Failed to sync cart after add:", err);
      }
    }
  };

  const removeFromCart = async (productId) => {
    // Update local state immediately
    setCart((prev) => {
      const updated = prev.filter((i) => i.productId !== productId);
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });

    // Only sync with backend if a user is logged in
    if (localStorage.getItem("token")) {
      try {
        // REPLACED: fetch("http://localhost:5000/api/cart/remove", ...)
        await api.post("/api/cart/remove", { productId });
      } catch (err) {
        console.error("Failed to sync cart after remove:", err);
      }
    }
  };

  const clearCart = async () => {
    // Update local state immediately
    setCart([]);
    localStorage.removeItem("cart");

    // Only sync with backend if a user is logged in
    if (localStorage.getItem("token")) {
      try {
        // REPLACED: fetch("http://localhost:5000/api/cart/clear", ...)
        await api.post("/api/cart/clear");
      } catch (err) {
        console.error("Failed to sync cart after clear:", err);
      }
    }
  };

  // --- Order Management Functions ---

  /**
   * Called by the Checkout page to store the completed order details 
   * and clear the current cart.
   * @param {Object} orderData - The structure returned by the backend after checkout.
   */
  const completeOrder = (orderData) => {
    setLastOrder(orderData);
    clearCart(); // Clear cart after a successful order
  };

  /**
   * Called by the Confirmation page to clear the transient order state after viewing.
   */
  const resetLastOrder = () => {
    setLastOrder(null);
  };
  
  // --- Calculation ---
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        clearCart, 
        total,
        // User (Duplicated, but kept for legacy integration)
        user,
        login,
        logout,
        // Order
        lastOrder,
        completeOrder, 
        resetLastOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
