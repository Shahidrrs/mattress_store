import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function OrderCancel() {
    const location = useLocation();
    const navigate = useNavigate();
    const { error, orderId } = location.state || {}; // Get state for error details

    const errorMessage = error || "Payment was not completed or failed due to an unknown error.";

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white p-8 sm:p-10 rounded-2xl shadow-2xl text-center border-t-8 border-red-600">
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
                    Payment Failed
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                    Unfortunately, your payment could not be processed. Please check your details and try again.
                </p>

                <div className="bg-red-50 p-4 rounded-xl space-y-2 text-left text-sm text-red-800 border border-red-200">
                    <p className="font-semibold">Reason for Failure:</p>
                    <p className="break-words">{errorMessage}</p>
                </div>
                
                {orderId && (
                    <p className="text-sm text-gray-500 mt-4">
                        Your Order ID (status: Pending): <span className="font-bold">{orderId}</span>
                    </p>
                )}

                <div className="mt-8 space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4">
                    <button 
                        onClick={() => navigate('/checkout')}
                        className="w-full sm:w-auto bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                    >
                        Return to Checkout
                    </button>
                    <button 
                        onClick={() => navigate('/shop')}
                        className="w-full sm:w-auto bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition duration-150"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}
