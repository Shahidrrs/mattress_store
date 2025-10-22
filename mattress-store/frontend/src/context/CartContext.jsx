import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
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
    // Called by AuthForm upon successful login/signup
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // Called by the Header component
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

  // --- Cart Management (Syncs with http://localhost:5000) ---

  const fetchCart = async () => {
    const token = localStorage.getItem("token");

    if (!user || !token) {
      // Guest cart from localStorage
      const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCart(guestCart);
      return;
    }

    // Logged-in user: fetch cart from backend
    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const backendCart = data.items?.map((item) => ({
        productId: item.product._id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
      })) || [];
      setCart(backendCart);
      localStorage.setItem("cart", JSON.stringify(backendCart));
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  };

  useEffect(() => {
    // Re-fetch cart whenever the user state changes (login/logout)
    fetchCart();
  }, [user]); 

  const addToCart = async (product, qty = 1) => {
    const token = localStorage.getItem("token");

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

    if (token) {
      try {
        await fetch("http://localhost:5000/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product._id, quantity: qty }),
        });
      } catch (err) {
        console.error("Failed to sync cart:", err);
      }
    }
  };

  const removeFromCart = async (productId) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.productId !== productId);
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });

    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch("http://localhost:5000/api/cart/remove", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem("cart");

    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch("http://localhost:5000/api/cart/clear", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error(err);
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
        // User
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
