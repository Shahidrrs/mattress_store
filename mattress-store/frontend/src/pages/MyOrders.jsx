import React, { useState, useEffect, useContext } from 'react';
import { Truck, Package, XOctagon } from 'lucide-react';
import { CartContext } from '../context/CartContext.jsx';
import api from '../utils/api.js'; // <-- Required import for the new logic

export default function MyOrders() {
    const { user } = useContext(CartContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Redirect if user is not logged in
    useEffect(() => {
        if (!user && !loading) {
            // Use navigation helper if available, otherwise suggest manual redirect
            console.log("User not logged in. Redirecting to home.");
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    }, [user, loading]);

    // Fetch user-specific orders
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return; // Wait for user to be authenticated

            setLoading(true);
            setError(null);
            
            // NOTE: Assuming your api.js utility handles authentication headers (Bearer token) automatically.
            // If it doesn't, you would need to retrieve the token and pass it in the config object here.

            try {
                // REFACTOR: Using api.get instead of hardcoded fetch
                // The API utility should handle the base URL and return { data: [...] } on success.
                const res = await api.get('/api/orders/mine'); 
                
                // Assuming api.get returns an object with a 'data' property
                const data = res.data;
                
                // Sort orders by creation date, newest first
                const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sortedOrders);

            } catch (err) {
                // Catch any error thrown by the api utility (e.g., failed status code or network error)
                const errorMessage = err.response?.data?.message || err.message || "Failed to fetch orders.";
                setError(errorMessage);
                console.error("Order Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    // Render Protection
    if (loading) {
        return (
            <div className="p-12 text-center text-indigo-600">
                <p className="text-xl animate-pulse">Loading Your Order History...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="p-12 text-center bg-red-100 text-red-800 rounded-xl m-8 max-w-4xl mx-auto shadow-lg">
                <XOctagon size={48} className="mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Error Loading Orders</h1>
                <p>{error}</p>
            </div>
        );
    }

    if (!user) {
        // This case should be handled by the useEffect redirect, but here as a fallback
        return (
             <div className="p-10 text-center">
                <h2 className="text-2xl font-bold text-gray-700">Please Log In</h2>
                <p className="text-gray-500 mt-2">Log in to view your past orders and history.</p>
            </div>
        );
    }

    // Utility function to get status badge
    const getStatusBadge = (status) => {
        let colorClass;
        let icon;
        switch (status) {
            case 'Pending':
                colorClass = 'bg-yellow-100 text-yellow-800';
                icon = <Package size={14} className="mr-1" />;
                break;
            case 'Shipped':
                colorClass = 'bg-blue-100 text-blue-800';
                icon = <Truck size={14} className="mr-1" />;
                break;
            case 'Delivered':
                colorClass = 'bg-green-100 text-green-800';
                icon = <Package size={14} className="mr-1" />;
                break;
            default:
                colorClass = 'bg-gray-100 text-gray-800';
                icon = <Package size={14} className="mr-1" />;
        }
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                {icon}
                {status}
            </span>
        );
    };

    return (
        <div className="p-8 md:p-12 max-w-6xl mx-auto min-h-screen bg-white shadow-xl rounded-xl my-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">
                My Order History
            </h1>

            {orders.length === 0 ? (
                <div className="text-center p-10 bg-gray-50 rounded-lg">
                    <p className="text-xl text-gray-600">You have no past orders yet.</p>
                    <p className="text-gray-500 mt-2">Start shopping now to see your order history here!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
                            <header className="flex justify-between items-center border-b pb-4 mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-indigo-700">Order ID: {order._id.substring(0, 10)}...</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Placed on: {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    {getStatusBadge(order.status)}
                                    <p className="text-2xl font-extrabold text-green-600 mt-1">
                                        ${order.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                            </header>

                            <div className="space-y-4">
                                {order.products.map((item, index) => (
                                    <div key={index} className="flex items-center space-x-4 border-b last:border-b-0 pb-3">
                                        <div className="flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden border">
                                            <img 
                                                src={item.imageUrl} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover" 
                                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/64x64/CCCCCC/333333?text=N/A" }}
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800">{item.title}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                                        </div>
                                        <p className="font-bold text-lg text-gray-900">${(item.quantity * item.price).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <footer className="pt-4 mt-4 text-sm text-gray-600 border-t">
                                <p className="font-semibold">Shipping Address:</p>
                                <p>{order.address.line1}, {order.address.city}, {order.address.postal_code}, {order.address.country}</p>
                            </footer>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
