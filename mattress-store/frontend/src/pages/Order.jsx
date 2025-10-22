import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext'; // CRITICAL: Import CartContext
import { Clock, ShoppingCart, Truck, CheckCircle } from 'lucide-react';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Mock function to format date
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// Map status strings to a display object
const STATUS_MAP = {
    Pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    Shipped: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100' },
    Delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
};

const OrderCard = ({ order }) => {
    const status = STATUS_MAP[order.orderStatus] || STATUS_MAP.Pending;
    const Icon = status.icon;

    return (
        <div className="bg-white shadow-xl rounded-xl p-6 mb-6 border-t-4 border-indigo-600 transition duration-300 hover:shadow-2xl">
            <header className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Order #{order.orderId.substring(0, 8)}</h3>
                    <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${status.bg}`}>
                    <Icon className={`w-4 h-4 ${status.color}`} />
                    <span className={`text-sm font-semibold ${status.color}`}>{order.orderStatus}</span>
                </div>
            </header>

            <section className="py-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-700 mb-2">Items Purchased:</h4>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm text-gray-600">
                            <span className="truncate">{item.title} (x{item.quantity})</span>
                            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="pt-4">
                <div className="flex justify-between items-center text-lg font-bold text-gray-800">
                    <span>Total Paid:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                    <p>Shipping to: {order.shippingAddress.line1}, {order.shippingAddress.city}</p>
                    <p>Payment Method: {order.paymentMethod}</p>
                </div>
            </footer>
        </div>
    );
};

export default function Orders() {
    // CRITICAL: Get user ID from CartContext
    const { user } = useContext(CartContext); 
    const userId = user?.id; // Assuming the mock user object has an 'id' field
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            setError("You must be logged in to view your orders.");
            return;
        }

        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch orders filtered by the current user's ID
                const response = await axios.get(`${apiUrl}/api/orders?userId=${userId}`);
                setOrders(response.data);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
                setError("Could not load order history. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [userId]);

    if (!userId) {
        return (
            <div className="text-center p-12 bg-white shadow-lg rounded-xl mt-10">
                <h2 className="text-2xl font-bold text-indigo-600 mb-4">Access Denied</h2>
                <p className="text-gray-600">Please log in to view your personalized order history.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center p-12 mt-10">
                <p className="text-lg font-medium text-gray-600">Loading your order history...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mt-4"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-12 bg-red-50 border border-red-200 rounded-xl mt-10">
                <h2 className="text-2xl font-bold text-red-700 mb-4">Error</h2>
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center p-12 bg-white shadow-lg rounded-xl mt-10">
                <ShoppingCart className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Found</h2>
                <p className="text-gray-600">It looks like you haven't placed any orders yet. Visit the Shop to find something amazing!</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-extrabold text-gray-900 border-b pb-4 mb-6">Your Order History</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order) => (
                    <OrderCard key={order._id} order={order} />
                ))}
            </div>
        </div>
    );
}