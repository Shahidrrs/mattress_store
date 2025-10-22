// server.js
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // KEEP this import
const dotenv = require("dotenv");

// Load env
dotenv.config();

const app = express();

// --- START SECURE CORS CONFIGURATION ---
const allowedOrigins = [
  // 1. The LIVE Frontend URL (The one the user visits):
  'https://mattress-store-1-frontend.onrender.com', 
  
  // 2. The Backend URL (Often needed for internal checks or if you test the API directly):
  'https://mattress-store-ig3e.onrender.com',
  
  // 3. Local Development (Crucial for when you code locally):
  'http://localhost:5000', // Assuming your frontend dev server runs on 5000 if not, change this
  
  // 4. Custom Domain Placeholder (Add your actual domain here when ready):
  'https://yourdomainname.com',
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true, // IMPORTANT for sending cookies/JWTs
};

// Apply the secure CORS options to all routes
app.use(cors(corsOptions)); 
// --- END SECURE CORS CONFIGURATION ---


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
