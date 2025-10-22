import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom';
import axios from 'axios'
import ProductGrid from '../components/ProductGrid.jsx'
// Placeholder icons since lucide-react might not be compiled
// import { Filter, SortAsc, SortDesc, Zap } from 'lucide-react'

const apiUrl = 'http://localhost:5000'

export default function ShopPage(){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Use useSearchParams to read and manage the URL query parameters
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category'); // e.g., "Prayer Mat"

  const [sortOrder, setSortOrder] = useState('price_asc') 
  
  // State to hold the active filter category
  const [filterCategory, setFilterCategory] = useState('all');

  // Update filterCategory state whenever the URL parameter changes
  useEffect(() => {
    // If a category is present in the URL, use it, otherwise default to 'all'
    setFilterCategory(urlCategory || 'all');
  }, [urlCategory]);


  // 1. Fetch all products on component mount
  useEffect(()=>{
    setLoading(true)
    axios.get(apiUrl + '/api/products')
      .then(r => setProducts(r.data))
      .catch(err => {
        console.error("Error fetching products:", err);
        // Display a message if API fails
        setProducts([]);
      })
      .finally(() => setLoading(false))
  }, [])

  // 2. Derive unique categories from the products list
  const categories = useMemo(() => {
    const allCategories = products.map(p => p.category).filter(Boolean);
    // Include the category from the URL, if it exists, to ensure it shows up in the dropdown even if no products match yet.
    const uniqueCategories = new Set(['all', urlCategory, ...allCategories].filter(Boolean));
    return Array.from(uniqueCategories).sort();
  }, [products, urlCategory]);

  // 3. Filter and Sort Logic (Memoized for performance)
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // --- Filtering ---
    if (filterCategory !== 'all') {
      result = result.filter(product => product.category === filterCategory);
    }

    // --- Sorting ---
    result.sort((a, b) => {
      switch (sortOrder) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'name_asc':
          return a.title.localeCompare(b.title);
        case 'name_desc':
          return b.title.localeCompare(a.title) * -1;
        default:
          return 0;
      }
    });

    return result;
  }, [products, filterCategory, sortOrder]);


  return (
    <div className="py-6">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center">
        {/* Placeholder icon for Zap */}
        <span className="text-3xl mr-3 text-indigo-600">✨</span> 
        {filterCategory === 'all' ? 'All Collections' : filterCategory}
      </h1>
      <p className="mb-8 text-gray-600">
        Browse {filteredAndSortedProducts.length} items in the current selection.
      </p>

      {/* Filter and Sort Controls */}
      <div className="bg-white p-4 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
        
        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          {/* Placeholder icon for Filter */}
          <span className="text-gray-500">⚙️</span> 
          <label htmlFor="category-filter" className="font-semibold text-gray-700">Filter By:</label>
          <select
            id="category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting Selector */}
        <div className="flex items-center space-x-2">
          {/* Placeholder icon for SortDesc */}
          <span className="text-gray-500">↕️</span> 
          <label htmlFor="sort-order" className="font-semibold text-gray-700">Sort By:</label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
          >
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center p-12 text-gray-600">Loading products...</div>
      ) : filteredAndSortedProducts.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl shadow-md text-gray-500">
          No products found in the "{filterCategory}" category.
        </div>
      ) : (
        <ProductGrid products={filteredAndSortedProducts} />
      )}
    </div>
  )
}