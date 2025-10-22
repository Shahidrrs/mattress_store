// server.js
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load env
dotenv.config();

const app = express();

// --- START ROBUST CORS CONFIGURATION (MUST BE FIRST) ---
const allowedOrigins = [
  'https://mattress-store-1-frontend.onrender.com',
  'https://mattress-store-ig3e.onrender.com', // Your Backend URL
  'http://localhost:5000',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
// --- END CORS CONFIGURATION ---


// 1. RAW BODY PARSER: APPLIED ONLY TO THE WEBHOOK ROUTE
// This must run before the global JSON parser to ensure the raw body is attached
// to req.body (or req.rawBody inside your handler) for signature verification.
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// 2. STANDARD JSON BODY PARSER: APPLIED TO ALL OTHER ROUTES
// This will run for /api/auth/login, /api/products, etc.
// Requests to /api/payments/webhook will skip this middleware.
app.use(express.json());



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