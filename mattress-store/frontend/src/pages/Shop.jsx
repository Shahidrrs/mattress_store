import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid.jsx'
import SearchInput from '../components/SearchInput.jsx'; // <-- NEW: Import SearchInput
import api from '../utils/api.js';

export default function ShopPage(){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [searchParams] = useSearchParams();
  // Get category from URL (for category filter)
  const urlCategory = searchParams.get('category'); 
  // <-- NEW: Get search query from URL
  const urlSearchQuery = searchParams.get('search') || ''; 

  const [sortOrder, setSortOrder] = useState('price_asc') 
  
  // State to hold the active filter category
  const [filterCategory, setFilterCategory] = useState('all');
  // <-- NEW: State to hold the search term from the input field
  const [searchTerm, setSearchTerm] = useState(urlSearchQuery);

  // Update filterCategory state whenever the URL parameter changes
  useEffect(() => {
    // If a category is present in the URL, use it, otherwise default to 'all'
    setFilterCategory(urlCategory || 'all');
  }, [urlCategory]);

  // <-- NEW: Update local search term state when URL search query changes
  useEffect(() => {
      setSearchTerm(urlSearchQuery);
  }, [urlSearchQuery]);


  // 1. Fetch all products on component mount
  useEffect(()=>{
    setLoading(true)
    api.get('/api/products')
      .then(r => setProducts(r.data))
      .catch(err => {
        console.error("Error fetching products:", err);
        setProducts([]);
      })
      .finally(() => setLoading(false))
  }, [])

  // 2. Derive unique categories from the products list
  const categories = useMemo(() => {
    const allCategories = products.map(p => p.category).filter(Boolean);
    const uniqueCategories = new Set(['all', urlCategory, ...allCategories].filter(Boolean));
    return Array.from(uniqueCategories).sort();
  }, [products, urlCategory]);

  // 3. Filter and Sort Logic (Memoized for performance)
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    const lowerSearchTerm = searchTerm.toLowerCase();

    // --- NEW: Search Filtering ---
    if (lowerSearchTerm) {
        result = result.filter(product => 
            // Check title OR description OR category for the search term
            product.title.toLowerCase().includes(lowerSearchTerm) ||
            (product.description && product.description.toLowerCase().includes(lowerSearchTerm)) ||
            (product.category && product.category.toLowerCase().includes(lowerSearchTerm))
        );
    }

    // --- Category Filtering ---
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
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [products, filterCategory, sortOrder, searchTerm]); // <-- Dependency added

  const displayCategory = filterCategory === 'all' ? 'All Collections' : filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1);

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center">
        <span className="text-3xl mr-3 text-indigo-600">✨</span> 
        {displayCategory}
      </h1>
      <p className="mb-8 text-gray-600">
        Browse **{filteredAndSortedProducts.length}** items in the current selection.
      </p>

      {/* Filter, Search, and Sort Controls */}
      <div className="bg-white p-4 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
        
        {/* Search Input */}
        <div className="flex-grow">
          {/* Note: In a real app, you might want to wrap this in a form and update URL params on search submit */}
          <SearchInput
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder={`Search within ${displayCategory}...`}
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">⚙️</span> 
          <label htmlFor="category-filter" className="font-semibold text-gray-700 whitespace-nowrap">Filter By:</label>
          <select
            id="category-filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Products' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">↕️</span> 
          <label htmlFor="sort-order" className="font-semibold text-gray-700 whitespace-nowrap">Sort By:</label>
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
          No products found matching the current filters or search term.
        </div>
      ) : (
        <ProductGrid products={filteredAndSortedProducts} />
      )}
    </div>
  )
}
