import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext.jsx'; 
import { AuthContext } from '../context/AuthContext.jsx';
// REMOVE: import axios from 'axios';
// NEW: Import the centralized API utility
import api from '../utils/api.js'; 
import { useNavigate } from 'react-router-dom';

// Utility function to dynamically load the Razorpay script
const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function Checkout() {
    // Contexts
    const { cart, total, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext); 
    const navigate = useNavigate();

    // --- STATE UPDATE: Address is a structured object to match the Mongoose model ---
    const [customer, setCustomer] = useState({ 
        name: user?.name || '', 
        email: user?.email || '', 
        phone: '', 
        address: { // Nested object structure
            line1: '', 
            line2: '', 
            city: '', 
            state: '', 
            zip: '', 
            country: 'India', // Defaulted as per model schema
            landmark: '' 
        } 
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(''); 

    const displayMessage = (msg) => {
        setMessage(msg);
        // Clear message after 5 seconds
        setTimeout(() => setMessage(''), 5000);
    };

    // Prefill user details if logged in (runs only on mount and when user object changes)
    useEffect(() => {
        if (user) {
            setCustomer(prev => ({
                ...prev,
                name: user.name,
                email: user.email,
            }));
        }
    }, [user]);
    
    // Display if cart is empty
    if (cart.length === 0) {
        return (
            <div className="text-center p-12 bg-white rounded-xl shadow-lg mt-10 max-w-lg mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
                <button 
                    onClick={() => navigate('/shop')}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition-colors mt-4"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    /**
     * Handles changes for both top-level fields (name, email, phone) 
     * and nested address fields (address.line1, address.city, etc.)
     */
    const handleChange = e => {
        const { name, value } = e.target;

        if (name.startsWith('address.')) {
            const field = name.split('.')[1];
            setCustomer(prev => ({ 
                ...prev, 
                address: { 
                    ...prev.address, 
                    [field]: value 
                } 
            }));
        } else {
            setCustomer({ ...customer, [name]: value });
        }
    };

    /**
     * Initiates the Razorpay popup and handles the crucial server-side order finalization 
     * after a successful payment.
     */
    const handleRazorpayPayment = async (orderId, razorpayOrderId, keyId) => {
        const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!res) {
            console.error('Razorpay SDK failed to load.');
            displayMessage('Payment gateway failed to load. Check internet connection.');
            return;
        }

        const options = {
            key: keyId, // Your Razorpay Key ID
            amount: total * 100, // Amount in paise
            currency: 'INR',
            name: 'Mattress Store',
            description: `Order ID: ${orderId}`,
            order_id: razorpayOrderId, // Razorpay Order ID
            handler: async function (response) {
                // This function runs on SUCCESSFUL PAYMENT
                try {
                    
                    // CRITICAL STEP: Send payment details for signature verification and status update
                    // REPLACED: axios.post(apiUrl + '/api/orders/confirm-payment', ...)
                    await api.post('/orders/confirm-payment', 
                        { 
                            orderId: orderId,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature, // Essential for server verification
                        }
                    );
                    
                    // If the server confirms, clear the cart and redirect
                    clearCart();
                    navigate('/order/success', { state: { orderId: orderId, paymentId: response.razorpay_payment_id } });
                } catch (err) {
                    // Handle failure in server-side verification/database update
                    console.error("Payment Finalization Failed:", err.response ? err.response.data : err.message);
                    displayMessage("Payment succeeded but order confirmation failed. Contact support with Order ID: " + orderId);
                }
            },
            prefill: {
                name: customer.name,
                email: customer.email,
                contact: customer.phone,
            },
            notes: { // Updated notes to reflect structured address data
                order_id: orderId, 
                customer_address_line1: customer.address.line1,
                customer_address_line2: customer.address.line2,
                customer_city: customer.address.city,
                customer_state: customer.address.state,
                customer_zip: customer.address.zip,
                customer_country: customer.address.country,
                customer_landmark: customer.address.landmark
            },
            theme: {
                color: '#4f46e5' // Indigo theme color
            }
        };

        const paymentObject = new window.Razorpay(options);
        
        // Handle closure of the payment window (failure/cancel)
        paymentObject.on('payment.failed', function (response){
            console.error("Razorpay Payment Failed:", response.error.description);
            // Redirect to a cancellation or failure page
            navigate('/order/cancel', { state: { error: response.error.description, orderId: orderId } });
        });

        paymentObject.open();
    };


    const pay = async () => {
        // Simple check to ensure required fields are present
        if (!isFormValid) {
            displayMessage("Please fill in all required fields (Name, Email, Phone, Address details) and ensure the cart is not empty.");
            return;
        }

        // Token check remains for UX, but api utility handles the actual header injection
        const token = localStorage.getItem('token');
        if (!token) {
            displayMessage('You must be logged in to place an order.');
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            
            // 1. Create Order in YOUR DATABASE (status: pending)
            // REPLACED: axios.post(apiUrl + '/api/orders/create', ...)
            const orderResponse = await api.post('/orders/create', 
                { 
                    items: cart, 
                    total, 
                    customer // This object now includes the structured address
                }
            );
            
            const orderId = orderResponse.data.orderId;

            // 2. Create Razorpay Order on BACKEND
            // REPLACED: axios.post(apiUrl + '/api/payments/create-order', ...)
            const paymentResponse = await api.post('/payments/create-order', 
                { 
                    orderId: orderId, 
                    amount: total, 
                    customerEmail: customer.email
                }
            );

            const { razorpayOrderId, keyId } = paymentResponse.data;

            // 3. Initiate Razorpay Checkout
            await handleRazorpayPayment(orderId, razorpayOrderId, keyId);

        } catch (err) {
            console.error("Payment Placement Error:", err.response ? err.response.data : err.message);
            
            let errorMessage = 'Payment initiation failed.';
            if (err.response && err.response.data && err.response.data.error) {
                errorMessage += ' Error: ' + err.response.data.error;
            } else if (err.message.includes('401')) {
                errorMessage = 'Order failed: You must be logged in.';
                // Only navigate if the error is definitely an auth error
                navigate('/login');
            }
            displayMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // --- VALIDATION UPDATE: Check all required address sub-fields, including landmark ---
    const isFormValid = customer.name && 
                        customer.email && 
                        customer.phone && 
                        customer.address.line1 && 
                        customer.address.city && 
                        customer.address.state && 
                        customer.address.zip && 
                        customer.address.landmark && // NEW: Landmark is now required
                        total > 0;

    return (
        <div className="py-8 font-inter min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">Secure Checkout (via Razorpay)</h1>
                
                {/* Message Display Area */}
                {message && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6 shadow-md" role="alert">
                        <span className="block sm:inline font-medium">{message}</span>
                    </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* 1. Delivery Details - Left Column */}
                    <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 text-indigo-700 border-b pb-3">Delivery & Contact Information</h2>
                        <div className="space-y-4">
                            <input 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" 
                                name="name" 
                                placeholder="Full Name (Required)" 
                                value={customer.name} 
                                onChange={handleChange} 
                                required
                            />
                            <input 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" 
                                name="email" 
                                placeholder="Email Address (Required)" 
                                value={customer.email} 
                                onChange={handleChange} 
                                type="email" 
                                required
                            />
                            <input 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" 
                                name="phone" 
                                placeholder="Phone Number (Required)" 
                                value={customer.phone} 
                                onChange={handleChange} 
                                type="tel"
                                required
                            />

                            {/* --- NEW ADDRESS FIELDS --- */}
                            <div className="pt-2">
                                <h3 className="text-lg font-semibold mb-2 text-gray-700">Shipping Address</h3>
                                <input 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 mb-3" 
                                    name="address.line1" 
                                    placeholder="Address Line 1 (Street address, apartment name, Required)" 
                                    value={customer.address.line1} 
                                    onChange={handleChange} 
                                    required
                                />
                                <input 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 mb-3" 
                                    name="address.line2" 
                                    placeholder="Address Line 2 (Apartment, suite, unit, optional)" 
                                    value={customer.address.line2} 
                                    onChange={handleChange} 
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                                    <input 
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" 
                                        name="address.city" 
                                        placeholder="City (Required)" 
                                        value={customer.address.city} 
                                        onChange={handleChange} 
                                        required
                                    />
                                    <input 
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" 
                                        name="address.state" 
                                        placeholder="State (Required)" 
                                        value={customer.address.state} 
                                        onChange={handleChange} 
                                        required
                                    />
                                    <input 
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" 
                                        name="address.zip" 
                                        placeholder="Zip/Pincode (Required)" 
                                        value={customer.address.zip} 
                                        onChange={handleChange} 
                                        required
                                    />
                                </div>
                                <input 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 mb-3" 
                                    name="address.landmark" 
                                    placeholder="Landmark (Required, e.g., Near Apollo Hospital)" // CHANGED PLACEHOLDER
                                    value={customer.address.landmark} 
                                    onChange={handleChange} 
                                    required // MADE COMPULSORY
                                />
                                <input 
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-500" 
                                    name="address.country" 
                                    placeholder="Country" 
                                    value={customer.address.country} 
                                    disabled
                                />
                            </div>
                            {/* --- END NEW ADDRESS FIELDS --- */}

                        </div>
                    </div>

                    {/* 2. Order Summary & Action - Right Column */}
                    <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-6 text-indigo-700 border-b pb-3">Order Summary</h2>
                        
                        <ul className="space-y-3 flex-grow">
                            {cart.map((i, idx) => (
                                <li key={i._id || idx} className="flex justify-between items-center text-gray-700 border-b border-gray-100 pb-2">
                                    <span className="text-sm font-medium truncate pr-2">{i.title} x {i.quantity}</span>
                                    <span className="text-sm font-semibold">₹{(i.price * i.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                        
                        <div className="mt-6 pt-4 border-t-2 border-indigo-200">
                            <div className="flex justify-between items-center text-xl font-extrabold text-gray-900">
                                <span>Order Total:</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button 
                            className={`w-full mt-6 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 
                                ${isFormValid && !loading ? 'bg-indigo-600 hover:bg-indigo-700 transform hover:scale-[1.01]' : 'bg-gray-400 cursor-not-allowed'}`} 
                            onClick={pay} 
                            disabled={!isFormValid || loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing Payment...
                                </span>
                            ) : (
                                `Pay Now with Razorpay (₹${total.toFixed(2)})`
                            )}
                        </button>
                        {!isFormValid && (
                            <p className="text-sm text-red-500 mt-2 text-center">
                                Please fill in all required fields to continue.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
