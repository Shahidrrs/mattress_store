const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer"); 
const router = express.Router();

// NOTE: In a real app, use environment variables for these secrets.
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key"; 
// 🔑 CRITICAL: Update this URL to your live domain when deployed
const CLIENT_URL = "http://localhost:5173"; 

// -----------------------------------------------------------
// 1. Nodemailer Setup (Update this section with your credentials!)
// -----------------------------------------------------------

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: "Gmail", // Use your email provider here (e.g., 'SendGrid', 'Gmail')
    auth: {
        user: "shahidlatif99999@gmail.com", // 1. Replace with your full email address
        pass: "sajs mmpe xpnu mrre", // 2. Replace with the 16-digit App Password (NOT your regular password)
    },
});

const sendResetEmail = async (user, token) => {
    // The link the user clicks in the email
    const resetUrl = `${CLIENT_URL}/auth?mode=reset&token=${token}`;

    const mailOptions = {
        to: user.email,
        from: `Your Shop Reset <YOUR_GMAIL_USERNAME>`, // Must match the 'user' email above
        subject: "Password Reset Request",
        html: `
            <p>You requested a password reset for your account.</p>
            <p>Please click the link below to reset your password. This link is only valid for 1 hour.</p>
            <a href="${resetUrl}">Reset Password Link</a>
            <p>If you did not request this, please ignore this email.</p>
            <p>Reset Token (For Manual Entry): <strong>${token}</strong></p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Password reset link sent to ${user.email}`);
    } catch (error) {
        console.error("[EMAIL ERROR] Could not send reset email. Check credentials and App Password:", error);
        throw new Error("Failed to send reset email.");
    }
};

// -----------------------------------------------------------
// 2. AUTH ROUTES (Login & Signup)
// -----------------------------------------------------------

// Signup
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Note: Hashing is handled by the userSchema.pre('save') hook
        const newUser = new User({ name, email, password });
        const savedUser = await newUser.save();

        const token = jwt.sign({ id: savedUser._id }, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            token,
            user: { id: savedUser._id, name: savedUser.name, email: savedUser.email }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Signup failed" });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Explicitly select the password field to ensure it is fetched for comparison
        const user = await User.findOne({ email }).select('+password');

        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // Use the instance method to compare the password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

        // IMPORTANT: Remove password before sending user object back to the client
        user.password = undefined; 

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login failed" });
    }
});

// -----------------------------------------------------------
// 3. PASSWORD RESET ROUTES
// -----------------------------------------------------------

// FORGOT PASSWORD (Initiates the process and sends the email)
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Return success even if user not found for security (prevents enumeration)
            return res.json({ message: "If an account exists, a password reset link has been sent to your email." });
        }

        // Generate and save token
        const token = require('crypto').randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send the email
        await sendResetEmail(user, token);

        res.json({ message: "If an account exists, a password reset link has been sent to your email." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error processing request." });
    }
});

// RESET PASSWORD (Finalize Reset)
router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Password reset token is invalid or has expired." });
        }
        
        // Update password (Mongoose pre-save hook will hash it automatically)
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        res.status(200).json({ message: "Password has been successfully reset. You can now log in." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error processing request." });
    }
});

module.exports = router;