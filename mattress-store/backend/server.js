// server.js
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser'); // <-- NEW IMPORT

// Load env
dotenv.config();

const app = express();

// --- CRITICAL SECURITY & COOKIE CONFIGURATION ---
// 1. Required for secure cookies/sessions behind a proxy (like Render)
app.set('trust proxy', 1); 

// 2. Cookie parser is necessary if you use JWTs in cookies or session management
app.use(cookieParser());

// 3. Minimal CORS configuration allowing your live frontend and credentials
const allowedOrigins = [
  'https://mattress-store-1-frontend.onrender.com', // Your LIVE Frontend URL
  'http://localhost:5173',                         // Default Vite Dev Server
  'http://localhost:5000',                         // Local Backend Dev
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // ESSENTIAL for authentication
}));
// --- END SECURITY CONFIGURATION ---


// Custom middleware to handle raw body ONLY for the webhook route
const razorpayWebhookMiddleware = (req, res, next) => {
    // Check if the request is for the webhook endpoint
    if (req.originalUrl === '/api/payments/webhook') {
        // Use express.raw() to get the raw body buffer
        express.raw({ type: 'application/json' })(req, res, (err) => {
            if (err) {
                console.error("Raw body parsing error:", err);
                return res.status(400).send('Bad Request');
            }
            // Store the raw body for signature verification in paymentRoutes.js
            req.rawBody = req.body;
            next();
        });
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
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
