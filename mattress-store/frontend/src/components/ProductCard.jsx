import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  return (
    // Updated container: rounded, strong shadow, and an interactive hover effect (lift and stronger shadow)
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group">
      {/* Link covers the image and details for product view */}
      <Link to={`/shop/${product.slug}`}>
        <img
          src={product.images?.[0] || "https://via.placeholder.com/400x300"}
          alt={product.title}
          // Image styling: object-cover for filling the space, and a slight zoom effect on hover
          className="h-48 w-full object-cover rounded-t-xl transition-transform duration-300 group-hover:scale-105"
        />
        <div className="p-4">
          <h3 className="mt-2 text-lg font-semibold text-gray-800 truncate">
            {product.title}
          </h3>
          <div className="mt-2 flex items-baseline justify-between">
            {/* Current Price: Bold and prominent */}
            <span className="text-xl font-extrabold text-red-600">
              ₹{product.price}
            </span>
            {/* Original Price: Smaller, gray, and struck out */}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="ml-2 text-sm text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button: Stronger color, full-width, and excellent hover/focus states */}
      <button
        onClick={() => addToCart(product, 1)}
        className="w-full bg-blue-600 text-white font-medium py-3 rounded-b-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Add to Cart
      </button>
    </div>
  );
}
