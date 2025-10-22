import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccess() {
    // Get state passed from the Checkout component after successful payment
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, paymentId } = location.state || {}; // Destructure state

    const hasData = orderId && paymentId;

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white p-8 sm:p-10 rounded-2xl shadow-2xl text-center border-t-8 border-indigo-600">
                <CheckCircle className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
                    Order Placed Successfully!
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                    Thank you for your purchase. We are processing your order and will send a confirmation email shortly.
                </p>

                {hasData ? (
                    <div className="bg-gray-50 p-6 rounded-xl space-y-3 text-left">
                        <p className="font-semibold text-gray-800">
                            Your Order ID: <span className="text-indigo-600 font-bold break-all">{orderId}</span>
                        </p>
                        <p className="font-semibold text-gray-800">
                            Payment Reference: <span className="text-indigo-600 font-bold break-all">{paymentId}</span>
                        </p>
                    </div>
                ) : (
                    <p className="text-red-500">
                        (Order details are missing. Please check your order history.)
                    </p>
                )}

                <div className="mt-8 space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4">
                    <button 
                        onClick={() => navigate('/shop')}
                        className="w-full sm:w-auto bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                    >
                        Continue Shopping
                    </button>
                    <button 
                        onClick={() => navigate('/orders')}
                        className="w-full sm:w-auto bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition duration-150"
                    >
                        View Order History
                    </button>
                </div>
            </div>
        </div>
    );
}
