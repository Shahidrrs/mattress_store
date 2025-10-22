const mongoose = require('mongoose');

// Define a detailed sub-schema for the address
const addressSchema = new mongoose.Schema({
    line1: { type: String, required: true },
    line2: { type: String }, // Optional apartment, unit, etc.
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    // Custom field requested by the user
    landmark: { type: String } 
}, { _id: false }); // We don't need an ID for this subdocument

const orderSchema = new mongoose.Schema({
    // Link to the user who placed the order
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    // Details of the items purchased
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            title: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            size: String // Optional size/variant info
        }
    ],
    total: { type: Number, required: true },
    
    // Shipping and Contact Information collected in Checkout.jsx
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: String,
        // *** UPDATED: Changed from String to the nested addressSchema ***
        address: { type: addressSchema, required: true }
    },
    
    // --- NEW TRACKING FIELDS ---
    trackingNumber: {
        type: String,
        default: null // Null until shipped
    },
    trackingLink: {
        type: String,
        default: null // Null until shipped
    },
    // --- END NEW FIELDS ---
    
    // --- RAZORPAY PAYMENT FIELDS (Crucial for Webhook Verification) ---
    isPaid: {
        type: Boolean,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    paymentMethod: {
        type: String,
        default: 'Razorpay',
    },
    razorpayDetails: { 
        paymentId: { type: String },
        orderId: { type: String },
        signature: { type: String },
    },
    // --- END PAYMENT FIELDS ---

    // Order status tracking
    status: { 
        type: String, 
        default: 'pending', 
        enum: ['created', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'] 
    },
    
}, {
    // Automatically manage createdAt and updatedAt fields
    timestamps: true 
});

module.exports = mongoose.model('Order', orderSchema);
