import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext'; // Assuming you have this context

// Placeholder for useLocation, as it's not strictly needed if using useParams for the slug
// and we want to ensure the component is robust.

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1); // State for quantity selector
  
  // Use useParams to get the slug from the URL path: /shop/:slug
  const { slug } = useParams();
  const { addToCart } = useContext(CartContext);

  // Hardcode the API URL, as environment variables are not directly accessible here.
  const apiURL = 'http://localhost:5000'; 

  useEffect(() => {
    if (slug) {
      const fetchProduct = async () => {
        try {
          const response = await axios.get(`${apiURL}/api/products/${slug}`);
          const fetchedProduct = response.data;
          setProduct(fetchedProduct);
          // Set the first image as the selected image when data loads
          if (fetchedProduct.images && fetchedProduct.images.length > 0) {
            setSelectedImage(fetchedProduct.images[0]);
          }
        } catch (err) {
          setError('Product not found or failed to fetch.');
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
  }, [slug, apiURL]);

  // Handler for adding to cart
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-xl text-gray-700 animate-pulse">Loading Product Details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-xl text-red-500 p-8 bg-white rounded-lg shadow-lg">{error || 'Product not found.'}</div>
      </div>
    );
  }

  // --- Main Product Detail View ---
  return (
    <div className="min-h-screen py-10">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-6 md:p-12">
        
        {/* Breadcrumb/Back link can go here */}
        
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* 1. Image Gallery Section (Left Side) */}
          <div className="w-full lg:w-7/12 flex flex-col-reverse md:flex-row gap-4">
            
            {/* Thumbnail Sidebar */}
            {product.images && product.images.length > 1 && (
              <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[500px] pb-2 md:pb-0">
                {product.images.map((imageUrl, index) => (
                  <div 
                    key={index}
                    className={`p-1 rounded-lg transition-all duration-200 border-2 cursor-pointer 
                                ${selectedImage === imageUrl ? 'border-blue-600 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}
                    onClick={() => setSelectedImage(imageUrl)}
                  >
                    <img
                      src={imageUrl}
                      alt={`${product.title} thumbnail ${index + 1}`}
                      className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Main Image */}
            <div className="flex-1 min-w-0">
              <img
                src={selectedImage || product.images?.[0] || "https://via.placeholder.com/800x800?text=Image+Missing"}
                alt={product.title}
                className="w-full h-auto max-h-[550px] object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
          
          {/* 2. Product Details and Action (Right Side) */}
          <div className="w-full lg:w-5/12 flex flex-col">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{product.title}</h1>
            
            {/* Price Block */}
            <div className="mb-6 border-b border-gray-200 pb-4">
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold text-red-600">
                  ₹{product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="ml-4 text-xl text-gray-500 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-sm text-green-600 font-semibold mt-1">
                  Save ₹{(product.originalPrice - product.price).toFixed(2)}!
                </p>
              )}
            </div>

            {/* Description */}
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Description</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>
            
            {/* Sizes/Options (if available) */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <span className="font-semibold text-gray-800 block mb-2">Available Sizes:</span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 text-sm bg-gray-100 rounded-full border border-gray-300 font-medium"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="mt-auto pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4 mb-6">
                <label htmlFor="quantity" className="font-semibold text-gray-800">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-[1.01]"
              >
                Add to Cart
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
