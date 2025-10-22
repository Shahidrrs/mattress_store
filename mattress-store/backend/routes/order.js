const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const protect = require("../middleware/protect");

// 🔹 Create an order — only logged-in users can access
router.post('/create', protect, async (req, res) => {
    try {
        // Now expecting 'customer' object from the frontend, where 'address' is an object
        const { items, total, customer } = req.body; 

        // 1. Basic Validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Order items are required' });
        }
        if (!total || typeof total !== 'number' || total <= 0) {
            return res.status(400).json({ error: 'Total amount is invalid' });
        }
        if (!customer || !customer.name || !customer.email) {
            return res.status(400).json({ error: 'Customer details (name, email) are required' });
        }
        
        // *** NEW: Detailed Address Validation for structured schema ***
        const address = customer.address;
        if (!address || !address.line1 || !address.city || !address.state || !address.zip || !address.country) {
            return res.status(400).json({ error: 'Customer address requires line1, city, state, zip, and country.' });
        }
        // *** END NEW VALIDATION ***

        // 2. Save order linked to logged-in user (req.user is from the protect middleware)
        const order = new Order({
            items,
            total,
            // Link the authenticated user ID
            userId: req.user._id, 
            // Save the shipping details from the frontend form
            // Mongoose will automatically map the structured customer object
            customer: customer, 
            status: 'created'
        });

        await order.save();

        res.status(201).json({
            orderId: order._id,
            message: 'Order created successfully. Payment integration not enabled yet.',
            order: order // Return the saved order for reference
        });
    } catch (err) {
        console.error("Order Creation Error:", err);
        res.status(500).json({ error: "Failed to create order: " + err.message });
    }
});

// 🔹 Confirm endpoint — update order after payment (minor updates for new model structure)
router.post('/confirm', protect, async (req, res) => {
    try {
        const { orderId, paymentId } = req.body;

        if (!orderId || !paymentId) {
            return res.status(400).json({ error: 'Order ID and Payment ID are required' });
        }

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Check ownership: only the user who created the order can confirm payment
        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You are not authorized to update this order' });
        }

        // NOTE: The payment update logic here may need to be adjusted based on your actual Razorpay implementation 
        // that handles the webhook and updates razorpayDetails
        order.paymentProviderPaymentId = paymentId; 
        order.status = 'paid';
        await order.save();

        res.json({ success: true, message: 'Order marked as paid.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 🚀 GET route to fetch all orders for the logged-in user
router.get('/history', protect, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        
        if (!orders.length) {
            return res.status(200).json([]);
        }

        res.json(orders);
    } catch (error) {
        console.error('Error fetching user order history:', error);
        res.status(500).json({ message: 'Server error: Could not retrieve order history.' });
    }
});


module.exports = router;
