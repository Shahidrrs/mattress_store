import React, { useState, useEffect, useContext } from 'react';
// import axios from 'axios'; // REMOVED: Using centralized API utility
import api from '../utils/api.js'; // NEW: Import the centralized API utility
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext'; // Assuming you have this context
import { ShoppingBag, DollarSign, XCircle, Loader2 } from 'lucide-react'; // Added Lucide icons

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1); // State for quantity selector
  
  // Use useParams to get the slug from the URL path: /shop/:slug
  const { slug } = useParams();
  const { addToCart } = useContext(CartContext);

  // Hardcode the API URL is no longer necessary as it's managed in api.js

  useEffect(() => {
    if (slug) {
      const fetchProduct = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // UPDATED: Use the centralized 'api' instance
          const response = await api.get(`/api/products/${slug}`);
          
          const fetchedProduct = response.data;
          setProduct(fetchedProduct);
          
          // Set the first image as the selected image when data loads
          if (fetchedProduct.images && fetchedProduct.images.length > 0) {
            setSelectedImage(fetchedProduct.images[0]);
          }
        } catch (err) {
          // Check for server/network errors
          if (err.message.includes('Network Error') || err.message.includes('timeout')) {
            setError("Network Error: Could not connect to the backend server.");
          } else {
            // Default error handling from API response
            const errorMessage = err.response?.data?.message || 'Product not found or failed to fetch.';
            setError(errorMessage);
          }
          console.error("Fetch Product Error:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    } else {
      setError('No product slug provided.');
      setIsLoading(false);
    }
  }, [slug]); // apiURL dependency removed

  // Handler for adding to cart
  const handleAddToCart = () => {
    if (product) {
      // This function (addToCart) must handle its own API call using the centralized 'api' instance
      addToCart(product, quantity);
    }
  };

  // Increase/Decrease quantity helpers
  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96 min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mr-3" />
        <div className="text-xl text-gray-700">Loading Product Details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center h-96 min-h-screen p-4">
        <div className="max-w-md w-full text-center p-10 bg-white rounded-xl shadow-2xl border-t-8 border-red-500">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Error Loading Product</h2>
          <div className="text-lg text-red-700">{error || 'Product not found.'}</div>
        </div>
      </div>
    );
  }

  // --- Main Product Detail View ---
  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden p-6 md:p-12">
        
        {/* Product Content */}
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* 1. Image Gallery Section (Left Side) */}
          <div className="w-full lg:w-7/12 flex flex-col-reverse md:flex-row gap-4">
            
            {/* Thumbnail Sidebar */}
            {product.images && product.images.length > 1 && (
              <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[550px] pb-2 md:pb-0">
                {product.images.map((imageUrl, index) => (
                  <div 
                    key={index}
                    className={`flex-shrink-0 w-20 h-20 p-1 rounded-lg transition-all duration-200 border-2 cursor-pointer 
                                ${selectedImage === imageUrl ? 'border-indigo-600 shadow-md ring-2 ring-indigo-300' : 'border-gray-200 hover:border-indigo-300'}`}
                    onClick={() => setSelectedImage(imageUrl)}
                  >
                    <img
                      src={imageUrl}
                      // Fallback placeholder in case of image load error
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/f3f4f6/9ca3af?text=Img"; }}
                      alt={`${product.title} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Main Image */}
            <div className="flex-1 min-w-0">
              <img
                src={selectedImage || product.images?.[0] || "https://placehold.co/800x800/f3f4f6/9ca3af?text=No+Image"}
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x800/f3f4f6/9ca3af?text=Image+Load+Error"; }}
                alt={product.title}
                className="w-full h-auto max-h-[550px] object-contain rounded-xl shadow-2xl transition-opacity duration-500"
              />
            </div>
          </div>
          
          {/* 2. Product Details and Action (Right Side) */}
          <div className="w-full lg:w-5/12 flex flex-col">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{product.title}</h1>
            <p className="text-sm text-gray-500 mb-6">Category: <span className="font-medium text-indigo-600">{product.category || 'Uncategorized'}</span></p>

            {/* Price Block */}
            <div className="mb-6 border-b border-gray-200 pb-4">
              <div className="flex items-baseline gap-2">
                <DollarSign className='w-6 h-6 text-red-600'/>
                <span className="text-4xl font-extrabold text-red-600">
                  ₹{Number(product.price).toFixed(2)}
                </span>
                {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                  <span className="ml-4 text-xl text-gray-500 line-through">
                    ₹{Number(product.originalPrice).toFixed(2)}
                  </span>
                )}
              </div>
              {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                <p className="text-sm text-green-600 font-semibold mt-2">
                  Awesome deal! Save ₹{(Number(product.originalPrice) - Number(product.price)).toFixed(2)}
                </p>
              )}
            </div>

            {/* Description */}
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Details</h2>
            <p className="text-gray-700 mb-6 leading-relaxed text-base">{product.description}</p>
            
            {/* Inventory Status */}
            <div className="mb-6">
              <p className={`font-bold text-lg flex items-center gap-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? (
                  <>In Stock ({product.stock} left)</>
                ) : (
                  <>Out of Stock</>
                )}
              </p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="mt-auto pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4 mb-6">
                <label htmlFor="quantity" className="font-semibold text-gray-800 flex-shrink-0">Quantity:</label>
                
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1 || product.stock <= 0}
                    className="p-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={product.stock || 1}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      const maxStock = product.stock || 1;
                      setQuantity(Math.max(1, Math.min(val, maxStock)));
                    }}
                    className="w-12 text-center py-2 focus:outline-none bg-white"
                    readOnly={product.stock <= 0}
                  />
                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= (product.stock || 0) || product.stock <= 0}
                    className="p-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-[1.005] disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <ShoppingBag className='w-6 h-6' />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
