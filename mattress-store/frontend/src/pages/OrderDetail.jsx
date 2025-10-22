import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, doc, onSnapshot, updateDoc, 
  collection, getDoc 
} from 'firebase/firestore';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { Shield, Truck, Edit, Save, Loader2, LinkIcon, XCircle } from 'lucide-react';

// --- Global Firebase Configuration (Mandatory Usage) ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' 
  ? __initial_auth_token 
  : null;

// --- Firebase Initialization and Hook ---

let dbInstance = null;
let authInstance = null;

const initializeFirebase = async () => {
    if (Object.keys(firebaseConfig).length === 0) {
        console.error("Firebase config is missing. Cannot initialize Firestore.");
        return null;
    }
    
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);
        
        // Authenticate using the provided token or anonymously
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }
        
        dbInstance = db;
        authInstance = auth;
        return { db, auth };
    } catch (error) {
        console.error("Error initializing Firebase or signing in:", error);
        return null;
    }
};

// --- Component: Admin Form for Tracking Updates ---

const AdminTrackingForm = ({ orderId, tracking, db, onSave, onCancel }) => {
    const [carrier, setCarrier] = useState(tracking.carrier || '');
    const [trackingNumber, setTrackingNumber] = useState(tracking.trackingNumber || '');
    const [trackingLink, setTrackingLink] = useState(tracking.trackingLink || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!db) return;

        setIsSaving(true);
        setSaveError(null);

        try {
            // Get the current authenticated user's ID
            const userId = authInstance?.currentUser?.uid || crypto.randomUUID();
            
            // Public path for collaborative/shared data like order tracking
            const orderDocRef = doc(db, 
                `artifacts/${appId}/public/data/orders`, 
                orderId
            );

            await updateDoc(orderDocRef, {
                tracking: {
                    carrier,
                    trackingNumber,
                    trackingLink
                }
            });

            onSave(); // Close the form
        } catch (error) {
            console.error("Error updating tracking info:", error);
            setSaveError("Failed to save tracking. Please check console for details.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-4 p-4 bg-white rounded-xl shadow-lg border border-indigo-100">
            <h3 className="text-xl font-semibold text-indigo-700 flex items-center">
                <Shield className="w-5 h-5 mr-2" /> Admin Tracking Update
            </h3>
            
            <div className="space-y-3">
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Carrier (e.g., FedEx, USPS)</span>
                    <input 
                        type="text" 
                        value={carrier} 
                        onChange={(e) => setCarrier(e.target.value)} 
                        placeholder="Carrier Name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                        required
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Tracking Number</span>
                    <input 
                        type="text" 
                        value={trackingNumber} 
                        onChange={(e) => setTrackingNumber(e.target.value)} 
                        placeholder="TRK-00000"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                        required
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Tracking Link (Optional)</span>
                    <input 
                        type="url" 
                        value={trackingLink} 
                        onChange={(e) => setTrackingLink(e.target.value)} 
                        placeholder="https://tracker.com/trk-00000"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    />
                </label>
            </div>

            {saveError && (
                <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                    <XCircle className="w-4 h-4 mr-2" /> {saveError}
                </div>
            )}

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
                    disabled={isSaving}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 transform hover:scale-[1.02]"
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" /> Save Tracking
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

// --- Component: Customer Facing Tracking Details ---

const TrackingDetailsDisplay = ({ tracking, onEdit }) => {
    const hasTracking = tracking.trackingNumber && tracking.carrier;

    return (
        <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-full flex flex-col justify-between">
            <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                    <Truck className="w-6 h-6 mr-2 text-indigo-500" /> Tracking Details
                </h2>

                {hasTracking ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Your order has been shipped and is on its way!
                        </p>
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                            <p className="font-semibold text-gray-800">Carrier:</p>
                            <p className="text-indigo-700 font-mono text-lg">{tracking.carrier}</p>
                        </div>
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                            <p className="font-semibold text-gray-800">Tracking Number:</p>
                            <p className="text-indigo-700 font-mono text-lg">{tracking.trackingNumber}</p>
                        </div>
                        
                        {tracking.trackingLink && (
                            <a 
                                href={tracking.trackingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition duration-150 text-sm mt-2"
                            >
                                <LinkIcon className="w-4 h-4 mr-1" /> Track Package
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <Truck className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600 font-medium">Tracking information is not yet available.</p>
                        <p className="text-sm text-gray-500">Please check back soon.</p>
                    </div>
                )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                    onClick={onEdit}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gray-800 hover:bg-gray-700 transition duration-150 transform hover:scale-[1.02]"
                >
                    <Edit className="w-5 h-5 mr-2" /> Edit (Admin)
                </button>
            </div>
        </div>
    );
};


// --- Main OrderDetail Component ---

export default function OrderDetail() {
    // Get orderId from the URL (e.g., /orders/12345)
    const { orderId } = useParams();
    
    // State for order data, Firebase readiness, and Admin form visibility
    const [orderData, setOrderData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [firebaseReady, setFirebaseReady] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);

    // 1. Initialize Firebase
    useEffect(() => {
        const setup = async () => {
            const result = await initializeFirebase();
            if (result) {
                setFirebaseReady(true);
            } else {
                setError("Failed to set up database connection.");
                setIsLoading(false);
            }
        };
        setup();
    }, []);

    // 2. Fetch/Subscribe to Order Data in Real-Time
    useEffect(() => {
        if (!firebaseReady || !orderId || !dbInstance) return;

        // Path to the public document: /artifacts/{appId}/public/data/orders/{orderId}
        const orderDocRef = doc(dbInstance, 
            `artifacts/${appId}/public/data/orders`, 
            orderId
        );

        // Set up real-time listener
        const unsubscribe = onSnapshot(orderDocRef, (docSnap) => {
            setIsLoading(false);
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Ensure a default tracking object exists
                if (!data.tracking) {
                    data.tracking = { carrier: '', trackingNumber: '', trackingLink: '' };
                }
                setOrderData(data);
                setError(null);
            } else {
                setOrderData(null);
                setError(`Order with ID: ${orderId} not found.`);
            }
        }, (err) => {
            // Error handling for onSnapshot
            console.error("Firestore error:", err);
            setError("Error fetching order data in real-time.");
            setIsLoading(false);
        });

        // Cleanup function to detach the listener when the component unmounts
        return () => unsubscribe();
    }, [firebaseReady, orderId]);

    // Render Logic
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="ml-3 text-lg text-indigo-700">Loading Order Details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-100 rounded-xl border-2 border-red-300">
                <h1 className="text-2xl font-bold text-red-700 mb-2">Error Loading Order</h1>
                <p className="text-red-600">{error}</p>
                <p className="text-sm text-red-500 mt-4">Please check the console for configuration errors.</p>
            </div>
        );
    }
    
    if (!orderData) {
        return (
            <div className="p-8 text-center bg-yellow-100 rounded-xl border-2 border-yellow-300">
                <h1 className="text-2xl font-bold text-yellow-700 mb-2">Order Not Found</h1>
                <p className="text-yellow-600">The order ID {orderId} could not be located in the database.</p>
            </div>
        );
    }

    // Actual Order Content (Mocked, focusing on the tracking panel)
    return (
        <div className="space-y-10">
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight border-b pb-4">
                Order <span className="text-indigo-600 font-mono">#{orderId}</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Left Column: Order Summary (Mock) --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Order Summary</h2>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <dt className="font-medium text-gray-500">Customer:</dt>
                            <dd className="text-gray-900">{orderData.customerName || "Jane Doe"}</dd>

                            <dt className="font-medium text-gray-500">Status:</dt>
                            <dd className="text-green-600 font-semibold">{orderData.status || "Confirmed"}</dd>

                            <dt className="font-medium text-gray-500">Order Date:</dt>
                            <dd className="text-gray-900">{orderData.orderDate || "Oct 17, 2025"}</dd>

                            <dt className="font-medium text-gray-500">Total:</dt>
                            <dd className="text-gray-900 font-bold text-lg">€{orderData.total || "149.99"}</dd>
                        </dl>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Items (Mock)</h2>
                        <ul className="space-y-4">
                            <li className="flex justify-between items-center border-b pb-2 last:border-b-0">
                                <span className="font-medium text-gray-700">The Sacred Scroll (x1)</span>
                                <span className="text-gray-600">€79.99</span>
                            </li>
                            <li className="flex justify-between items-center border-b pb-2 last:border-b-0">
                                <span className="font-medium text-gray-700">The Mat (x1)</span>
                                <span className="text-gray-600">€70.00</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* --- Right Column: Tracking Panel (The main focus) --- */}
                <div className="lg:col-span-1">
                    {/* Conditional rendering for the Admin Form or the Customer View */}
                    {isEditing ? (
                        <AdminTrackingForm
                            orderId={orderId}
                            tracking={orderData.tracking}
                            db={dbInstance}
                            onSave={() => setIsEditing(false)}
                            onCancel={() => setIsEditing(false)}
                        />
                    ) : (
                        <TrackingDetailsDisplay
                            tracking={orderData.tracking}
                            onEdit={() => setIsEditing(true)}
                        />
                    )}
                </div>
            </div>
            
            <div className="p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
                **Note on Data:** The tracking information is fetched in real-time from Firestore.
                The rest of the order details are mocked but would follow a similar `onSnapshot` pattern.
            </div>
        </div>
    );
}
