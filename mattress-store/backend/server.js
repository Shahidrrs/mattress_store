// server.js
require('dotenv').config(); 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require('express-session'); // REQUIRED: For state and cookie management

const app = express();

// Determine if we are running in a production environment (like Render)
const isProduction = process.env.NODE_ENV === 'production';

// --- CRITICAL DEPLOYMENT FIXES ---
// 1. MUST trust the Render proxy for secure cookies/headers (HTTPS)
app.set('trust proxy', 1); 

// 2. Define ALL allowed origins
const allowedOrigins = [
    'https://mattress-store-1-frontend.onrender.com', // Deployed Frontend URL
    'http://localhost:5173', // Local Frontend URL (Vite default)
    'http://localhost:5000', // Local Backend URL (Self-reference)
    'https://mattress-store-ig3e.onrender.com' // Deployed Backend URL (Self-reference)
];

// 3. Configure CORS: MUST use specific origins when credentials are true
app.use(cors({ 
    // Custom logic to allow listed origins
    origin: (origin, callback) => {
        // Allow requests with no origin (like Postman/server-to-server) or from the allowed list
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Log the blocked origin for debugging
            console.error('CORS blocked request from:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true // Required for sending session cookies
})); 
// ---------------------------------------

// 4. Configure Express Session (Crucial for state management and cookie security on Render)
app.use(session({
    // Use a secret key from your environment variables
    secret: process.env.SESSION_SECRET || 'a-strong-default-secret-for-mattress-store',
    resave: false,
    saveUninitialized: false,
    cookie: {
        // MUST set secure: true ONLY in production (Render) where HTTPS is used
        secure: isProduction, 
        // MUST set sameSite: 'none' when secure is true for cross-domain cookies
        sameSite: isProduction ? 'none' : 'lax', 
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));


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
// Use Render's dynamically assigned port (process.env.PORT) or default to 5000 locally
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
