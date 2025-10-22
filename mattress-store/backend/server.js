// server.js
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load env
dotenv.config();

const app = express();

// 🛑 THE CRITICAL CHANGE: Replace app.use(cors()); with the secure config
const FRONTEND_URL = 'https://mattress-store-1-frontend.onrender.com';
app.use(cors({
    origin: FRONTEND_URL, // Only allow this specific URL
    credentials: true     // Essential for logging in (cookies/JWTs)
}));
// 🛑 END CRITICAL CHANGE


// Custom middleware to handle raw body ONLY for the webhook route
const razorpayWebhookMiddleware = (req, res, next) => {
// ... (rest of your original razorpayWebhookMiddleware function)
    if (req.originalUrl === '/api/payments/webhook') {
        // ... (raw body parsing)
    } else {
        // For all other routes, use standard express.json()
        express.json()(req, res, next);
    }
};

// Apply the custom webhook middleware globally
app.use(razorpayWebhookMiddleware);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// --- ROUTES IMPORTS ---
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/order");
const cartRoutes = require("./routes/cart");
const paymentRoutes = require('./routes/paymentRoutes');

// --- ROUTE MIDDLEWARE ---
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);

// Test Route
app.get("/", (req, res) => res.send("Server is running 🚀"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('✅ Server running on http://localhost:${PORT}'));