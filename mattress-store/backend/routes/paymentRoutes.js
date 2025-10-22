// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const Razorpay = require('razorpay');
const crypto = require('crypto'); // We need the crypto module for verification
const Order = require('../models/Order'); // Assuming you have an Order model

// Initialize Razorpay with keys from environment variables
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, 
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 🔹 POST /api/payments/create-order
// Protected route to securely create a payment order on Razorpay's server
router.post('/create-order', protect, async (req, res) => {
    try {
        const { orderId, amount, customerEmail } = req.body;

        if (!orderId || !amount || amount <= 0) {
            return res.status(400).json({ error: 'Order ID and valid amount are required.' });
        }

        // Razorpay expects the amount in the lowest currency unit (paise for INR)
        const totalInPaise = Math.round(amount * 100); 

        const options = {
            amount: totalInPaise, 
            currency: 'INR',
            receipt: orderId, // Link this payment to your database order ID
            payment_capture: 1, // Auto capture the payment
            notes: {
                order_id: orderId,
                user_id: req.user._id.toString(),
                email: customerEmail
            }
        };

        const rzpOrder = await instance.orders.create(options);

        // Send the Razorpay Order ID and Key ID back to the frontend
        res.json({ 
            razorpayOrderId: rzpOrder.id,
            keyId: instance.key_id // Send the key ID for the frontend widget
        });

    } catch (err) {
        console.error("Razorpay Order Creation Error:", err);
        res.status(500).json({ error: err.message || "Failed to create Razorpay order." });
    }
});

// 🔒 POST /api/payments/webhook
// This route receives the payment confirmation from Razorpay's server (server-to-server communication)
// IMPORTANT: This route MUST use the raw body parsing middleware (applied in server.js)
router.post('/webhook', async (req, res) => {
    try {
        // 1. Get the signature and secret
        const signature = req.headers['x-razorpay-signature'];
        // Use req.rawBody which was created by the middleware in server.js
        const body = req.rawBody.toString(); 
        
        // 2. Compute HMAC signature using SHA256
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest('hex');

        // 3. Compare the computed signature with the received signature
        if (expectedSignature !== signature) {
            console.warn("Webhook Signature Mismatch: Request rejected.");
            // Send a 400 but hide the reason to prevent revealing the secret
            return res.status(400).send('Invalid signature'); 
        }

        // 4. Process the verified event
        const event = JSON.parse(body);
        const orderId = event.payload?.payment?.entity?.notes?.order_id;
        
        if (!orderId) {
             console.warn("Webhook received without a valid order_id.");
             return res.status(400).send('Order ID missing.');
        }

        if (event.event === 'order.paid' || event.event === 'payment.captured') {
            
            // Find the order in your database and update its status
            const order = await Order.findByIdAndUpdate(orderId, {
                isPaid: true,
                paymentMethod: 'Razorpay', // Or whatever payment info you want to save
                paidAt: new Date(),
                razorpayDetails: { // Save payment details for reference
                    paymentId: event.payload.payment.entity.id,
                    orderId: event.payload.order.entity.id,
                    signature: signature
                }
            }, { new: true });

            if (order) {
                console.log(`✅ Order ${orderId} successfully marked as PAID via webhook.`);
                // You would typically send fulfillment emails, reduce inventory, etc., here.
            } else {
                console.error(`Order not found for ID: ${orderId}`);
            }

        } else if (event.event === 'payment.failed') {
            // Log failure or update order to 'failed' status
            console.log(`❌ Payment failed for order ${orderId}. Details:`, event.payload.payment.entity.error_description);
            // Optionally update Order model status to 'Failed'

        }

        // Always return 200 OK to Razorpay to acknowledge receipt, even if processing failed.
        res.status(200).send('OK');

    } catch (err) {
        console.error("Error processing Razorpay Webhook:", err);
        res.status(500).send('Webhook processing error');
    }
});

module.exports = router;