import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'; // ADDED: useNavigate for redirecting
import api from '../utils/api.js' 
import ProductGrid from '../components/ProductGrid.jsx'
import SearchInput from '../components/SearchInput.jsx' // NEW: Import SearchInput

// Define the new categories for the homepage cards
const CATEGORY_CARDS = [
  { name: "Prayer Mat", icon: "🕋", color: "bg-green-100", hover: "hover:bg-green-200" },
  { name: "Tasbeeh", icon: "📿", color: "bg-blue-100", hover: "hover:bg-blue-200" },
  { name: "Digital Tasbeeh Counter", icon: "🔢", color: "bg-yellow-100", hover: "hover:bg-yellow-200" },
  { name: "Attar & Perfume", icon: "🍾", color: "bg-pink-100", hover: "hover:bg-pink-200" },
  { name: "Quran Box", icon: "📖", color: "bg-indigo-100", hover: "hover:bg-indigo-200" },
  { name: "Imama Sharif", icon: "👑", color: "bg-red-100", hover: "hover:bg-red-200" },
  { name: "Haji Rumal", icon: "🧣", color: "bg-teal-100", hover: "hover:bg-teal-200" },
];

export default function HomePage(){
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('') // NEW: State for Search Input
  const navigate = useNavigate(); // NEW: Hook for redirection

  useEffect(()=>{
    // Fetch products using the imported api utility
    api.get('/api/products')
      .then(r => {
        // Filter for products marked as featured and limit to 6 for the homepage grid
        const featuredProducts = r.data.filter(p => p.featured).slice(0, 6);
        setFeatured(featuredProducts);
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const categoryToSlug = (category) => encodeURIComponent(category);
  
  // NEW: Handler for Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    if (searchTerm.trim()) {
        // Redirect to /shop and pass the search term as a URL query parameter
        navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };


  return (
    <div className="py-10">
      {/* Hero Section - Styled for a modern, bold look */}
      <section className="bg-indigo-700 text-white rounded-2xl p-10 md:p-16 mb-12 shadow-2xl transition-all duration-500">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Enhance Your Spiritual Journey
        </h1>
        <p className="mt-4 text-lg md:text-xl font-light opacity-90 max-w-2xl">
          Discover our curated collection of essential Islamic accessories designed for comfort, devotion, and quality.
        </p>
        
        {/* NEW: Search Form in Hero Section */}
        <form onSubmit={handleSearchSubmit} className="mt-8 max-w-lg">
            <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />
        </form>
        {/* End Search Form */}

        <Link to="/shop" className="inline-block mt-6 bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-200 transform hover:scale-105">
            Shop All Collections
        </Link>
      </section>

      {/* Shop By Category Section */}
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-4 border-indigo-100 pb-3">
        Shop By Category
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-12">
        {CATEGORY_CARDS.map((category) => (
          <Link
            key={category.name}
            to={`/shop?category=${categoryToSlug(category.name)}`}
            className={`flex flex-col items-center justify-center p-4 rounded-xl transition duration-300 transform hover:scale-105 shadow-md ${category.color} ${category.hover}`}
          >
            <span className="text-4xl mb-2">{category.icon}</span>
            <p className="text-sm font-semibold text-gray-800 text-center">{category.name}</p>
          </Link>
        ))}
      </div>


      {/* Featured Products Section */}
      <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b-4 border-indigo-100 pb-3">
        Our Featured Mat & Accessory Picks
      </h2>

      {loading ? (
        <div className="text-center p-8 text-gray-500">Loading featured products...</div>
      ) : featured.length > 0 ? (
        <ProductGrid products={featured} />
      ) : (
        <div className="text-center p-8 text-gray-500 bg-white rounded-xl shadow-md">
            No featured products available at the moment. Please check the Admin Panel to add some.
        </div>
      )}
    </div>
  )
}
