import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Package, Clock, DollarSign, List, XCircle, Loader2, ShoppingBag, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// NOTE: We rely on the fact that the previous path fix (or your environment) is now working.
// We are continuing without explicitly defining the Auth context here.

// Utility function to get the base API URL
const getApiUrl = () => typeof __api_url !== 'undefined' ? __api_url : 'http://localhost:5000';

// Component to display a single order card
const OrderCard = ({ order }) => {
    const statusClasses = {
        'created': 'bg-yellow-100 text-yellow-800',
        'paid': 'bg-indigo-100 text-indigo-800', 
        'shipped': 'bg-blue-100 text-blue-800',
        'delivered': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800',
    };

    const totalAmount = Number(order.total).toFixed(2); 
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
    const orderStatus = order.status ? order.status.toLowerCase() : 'created';
    const statusText = order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Created';
    
    // Safely access the address object
    const address = order.customer?.address;
    
    // Safely access tracking info
    const trackingNumber = order.trackingNumber;
    const trackingLink = order.trackingLink;


    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
            <div className="flex justify-between items-start border-b pb-3 mb-3">
                {/* Order ID and Status */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-500" />
                        Order ID: <span className="font-mono text-base text-indigo-600 break-all text-xs sm:text-base">{order._id}</span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                         <Clock className="w-4 h-4" />
                        Placed on: {orderDate}
                    </p>
                </div>
                <span 
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[orderStatus] || 'bg-gray-100 text-gray-800'}`}
                >
                    {statusText}
                </span>
            </div>

            {/* Order Summary and Items */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                
                {/* Column 1: Total Paid */}
                <div className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                    <div className="text-sm font-medium text-gray-500 flex items-center gap-1 mb-1">
                        <DollarSign className="w-4 h-4" /> Total Paid:
                    </div>
                    <span className="font-extrabold text-2xl text-red-600">₹{totalAmount}</span>
                    <p className="text-sm text-gray-600 mt-1">{order.items.length} unique items</p>
                </div>

                {/* Column 2: Shipping Information */}
                <div className="md:col-span-2 pt-0 md:pt-0">
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-indigo-500" /> Shipping Address:
                    </p>
                    {address?.line1 ? (
                        <address className="text-sm text-gray-700 not-italic space-y-0.5">
                            {/* Address Line 1 */}
                            <span className="block">{address.line1}</span>
                            {/* Address Line 2 (Optional) */}
                            {address.line2 && (<span className="block">{address.line2}</span>)}
                            {/* Landmark (New Field) */}
                            {address.landmark && (<span className="block text-xs text-gray-500 italic">Near: {address.landmark}</span>)}
                            {/* City, State, Zip */}
                            <span className="block">{address.city}, {address.state} - {address.zip}</span>
                            {/* Country */}
                            <span className="block text-xs font-medium text-gray-500">{address.country}</span>
                        </address>
                    ) : (
                        <p className="text-sm text-gray-500">Shipping address not available.</p>
                    )}
                </div>

            </div>
            
            {/* Tracking & Items Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100 mt-4">
                
                {/* Tracking Info */}
                <div className="md:col-span-1">
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Navigation className="w-4 h-4 text-green-500" /> Tracking:
                    </p>
                    {trackingNumber ? (
                        <div className="space-y-1">
                            <p className="text-sm font-mono text-gray-800 break-all">ID: {trackingNumber}</p>
                            {trackingLink && (
                                <a 
                                    href={trackingLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                                >
                                    Track Package
                                </a>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Tracking information not yet available.</p>
                    )}
                </div>

                {/* Items List */}
                <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <List className="w-4 h-4" />
                        Items in this order:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1 max-h-24 overflow-y-auto pl-2">
                        {order.items.map((item, index) => (
                            <li key={item.productId || index} className="flex justify-between border-b border-dashed border-gray-100 last:border-b-0 py-0.5">
                                <span className="truncate pr-2 font-medium">{item.name || item.title || 'Product'}</span>
                                <span className="font-bold text-gray-800">Qty: {item.quantity}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default function OrderHistory() {
    // NOTE: We are relying on localStorage for token and assuming no AuthContext for compilation safety.
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            fetchOrders(token);
        } else {
            setIsLoggedIn(false);
            setIsLoading(false);
        }
    }, []);

    const fetchOrders = async (token) => {
        setIsLoading(true);
        setError(null);
        console.log("Starting API call to fetch order history with token...");

        try {
            const apiURL = getApiUrl();
            const url = `${apiURL}/api/orders/history`;
            console.log("API URL:", url);
            
            const response = await axios.get(url, {
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });

            setOrders(response.data || []);
            console.log("Order history fetched successfully. Total orders:", response.data.length);
        } catch (err) {
            console.error("Error fetching order history:", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                 setIsLoggedIn(false);
                 setError("Session expired or invalid token. Please log in.");
            } else if (err.message.includes('Network Error')) {
                setError("Network Error: Could not connect to the backend server. Please ensure the server is running.");
            } else {
                const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to load order history. Check your network or contact support.";
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    // 1. Loading State
    if (isLoading && isLoggedIn) {
        return (
            <div className="flex justify-center items-center py-20 min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mr-3" />
                <p className="text-xl text-gray-700 font-semibold">Loading your order history...</p>
            </div>
        );
    }
    
    // 2. Not Logged In / Access Denied State
    if (!isLoggedIn) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="max-w-md bg-white p-10 rounded-xl shadow-2xl text-center border-t-8 border-yellow-500">
                    <XCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-4">
                        You must be logged in to view your order history.
                    </p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }
    
    // 3. Error State
    if (error) {
        return (
            <div className="text-center py-12 px-6 text-red-700 bg-red-50 rounded-xl border border-red-200 shadow-lg mt-10">
                <h2 className="text-xl font-semibold mb-2">Order Load Failure</h2>
                <p>{error}</p>
                <p className='mt-4 text-sm text-red-600 font-medium'>If the server is running, check your login status and network connection.</p>
            </div>
        );
    }

    // 4. No Orders Found
    if (orders.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl shadow-lg mt-10 p-8">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 mb-2">No Past Orders Found</h1>
                <p className="text-lg text-gray-600 mb-6">Looks like you haven't placed any orders yet!</p>
                <button 
                    onClick={() => navigate('/shop')}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-full shadow-md hover:bg-indigo-700 transition-all font-semibold"
                >
                    Start Shopping
                </button>
            </div>
        );
    }


    // 5. Success State
    return (
        <div className="py-8 max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center border-b pb-4">
                <Truck className="w-8 h-8 mr-3 text-indigo-600"/>
                My Order History ({orders.length})
            </h1>

            <div className="space-y-6">
                {orders.map(order => (
                    <OrderCard key={order._id} order={order} />
                ))}
            </div>
        </div>
    );
}
