import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) return <p>No products found.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product._id} className="bg-white shadow rounded p-4">
          <ProductCard product={product} />
          {/* ✅ Removed duplicate Add to Cart button */}
        </div>
      ))}
    </div>
  );
}
