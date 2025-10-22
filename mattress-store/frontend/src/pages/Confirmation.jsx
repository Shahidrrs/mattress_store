import React, { useContext, useEffect, useState } from 'react';
import { CheckCircle, Package, Home as HomeIcon } from 'lucide-react';
import { CartContext } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Confirmation() {
    const { lastOrder, resetLastOrder, user } = useContext(CartContext);
    const navigate = useNavigate();
    // Use local state to capture lastOrder from context, as context state is cleared after initial load
    const [orderDetail] = useState(lastOrder);

    // Effect to clean up the lastOrder state and redirect if data is missing
    useEffect(() => {
        // If the order details were loaded successfully, clear the context state
        if (orderDetail) {
            resetLastOrder();
        }
        
        // If there's no order detail, redirect home after a short delay
        const timer = setTimeout(() => {
            if (!orderDetail) {
                console.log("No order data found. Redirecting to home.");
                navigate('/');
            }
        }, 5000); // Redirect after 5 seconds if no order data is found

        return () => clearTimeout(timer);
    // Dependencies: orderDetail, resetLastOrder (from context), and navigate
    }, [orderDetail, resetLastOrder, navigate]);


    // --- Loading/Redirecting State ---
    if (!orderDetail) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-gray-50">
                <Package size={64} className="text-gray-400 mb-4 animate-bounce" />
                <h1 className="text-3xl font-bold text-gray-800 mb-3">Looking for your order...</h1>
                <p className="text-gray-600 mb-6">Redirecting you to the home page shortly if no order details are found.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                >
                    <HomeIcon size={20} />
                    <span>Continue Shopping</span>
                </button>
            </div>
        );
    }

    // --- Confirmation Display State ---

    // Use destructuring with defaults for safety based on expected MongoDB order response
    const {
        _id: orderId = 'N/A', // Using MongoDB's _id as orderId
        totalAmount = 0,
        shippingAddress: address = { line1: 'N/A', city: 'N/A', postal_code: 'N/A', country: 'N/A' },
        items: products = [], // The products array from the backend response
        createdAt
    } = orderDetail;

    return (
        <div className="max-w-3xl mx-auto p-8 md:p-12 my-12 bg-white rounded-2xl shadow-2xl border-t-4 border-indigo-600">
            <div className="text-center mb-8">
                <CheckCircle size={80} className="text-green-500 mx-auto mb-4 animate-pulse" />
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-xl text-gray-600">Thank you for your purchase, {user?.name || 'Customer'}!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6 mb-6">
                {/* Order Details Card */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                    <h2 className="text-lg font-bold text-indigo-700 mb-2">Order Details</h2>
                    <p className="text-sm text-gray-700"><strong>Order ID:</strong> {orderId.substring(0, 12)}...</p>
                    <p className="text-sm text-gray-700"><strong>Total:</strong> <span className="text-green-600 font-bold">${totalAmount.toFixed(2)}</span></p>
                    <p className="text-sm text-gray-700"><strong>Date:</strong> {createdAt ? new Date(createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                </div>
                {/* Shipping Details Card */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-bold text-gray-700 mb-2">Shipping To</h2>
                    <p className="text-sm text-gray-700">{address.line1}</p>
                    <p className="text-sm text-gray-700">{address.city}, {address.postal_code}</p>
                    <p className="text-sm text-gray-700">{address.country}</p>
                </div>
            </div>

            {/* Purchased Items Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Items Purchased</h2>
                <div className="space-y-3">
                    {/* Map through the items array to show purchased products */}
                    {products.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div className="flex items-center space-x-3">
                                {/* Assuming product details are nested in item.product */}
                                <div className="text-sm font-medium text-gray-900">{item.product.title}</div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">{item.quantity} x ${item.product.price.toFixed(2)}</p>
                                <p className="font-semibold text-indigo-600">${(item.quantity * item.product.price).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
                <button 
                    onClick={() => navigate('/shop')}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                    <HomeIcon size={20} />
                    <span>Shop More</span>
                </button>
                <button 
                    onClick={() => navigate('/my-orders')}
                    className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                >
                    <Package size={20} />
                    <span>View My Orders</span>
                </button>
            </div>
        </div>
    );
}
