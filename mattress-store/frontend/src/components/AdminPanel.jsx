import React, { useState } from 'react'
import api from '../utils/api.js' // Import the centralized API utility

// Define the categories (must match Header.jsx and Home.jsx)
const CATEGORIES = [
  "Prayer Mat",
  "Tasbeeh",
  "Digital Tasbeeh Counter",
  "Attar & Perfume",
  "Quran Box",
  "Imama Sharif",
  "Haji Rumal"
];

// NOTE: This component now relies on the Axios interceptor in api.js 
// to automatically attach the logged-in user's token from localStorage.

export default function AdminPanel(){
  const [form, setForm] = useState({ 
    title: '', 
    slug: '', 
    description: '', 
    price: 0, 
    sizes: 'Single,Double', 
    images: '',
    // CRITICAL: Initialize the category field
    category: CATEGORIES[0] 
  })
  
  const [message, setMessage] = useState(''); // State for success/error messages

  const submit = async () => {
    setMessage('');
    try {
      const payload = { 
        ...form, 
        price: parseFloat(form.price), // Ensure price is a number
        sizes: form.sizes.split(',').map(s=>s.trim()), 
        images: form.images.split(',').map(u=>u.trim()),
        featured: false, // Default to false
      }
      
      console.log('Attempting to add product with payload:', payload);

      // FIX: Added /api prefix to the products endpoint. 
      // Removed manual 'x-admin-token' header, relying on the 'api.js' interceptor.
      await api.post('/api/products', payload);
      
      console.log('Product added successfully!');
      setMessage('✅ Product added successfully! You may need to refresh your shop page.');
      setForm({ title: '', slug: '', description: '', price: 0, sizes: 'Single,Double', images: '', category: CATEGORIES[0] }); // Clear form

    } catch (err) { 
      console.error('Failed to add product:', err.response?.data || err.message); 
      const errorMsg = err.response?.data?.message || err.message || "Failed to add product. Check console.";
      setMessage(`❌ Failed to add product. Error: ${errorMsg}`); 
    }
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-lg mx-auto my-10">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6 border-b-4 border-indigo-100 pb-2">Admin - Product Management</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded-lg font-semibold ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        
        {/* Category Selector */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
          <select 
            id="category"
            value={form.category} 
            onChange={e => setForm({...form, category: e.target.value})} 
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition" 
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition" />
        <input placeholder="Slug (e.g., deluxe-prayer-mat)" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition" />
        
        <div className="flex space-x-4">
          <input placeholder="Price" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition" />
          <input placeholder="Sizes (comma separated, e.g., Small,Large)" value={form.sizes} onChange={e=>setForm({...form,sizes:e.target.value})} className="w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition" />
        </div>
        
        <input placeholder="Images (comma separated URLs)" value={form.images} onChange={e=>setForm({...form,images:e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition" />
        
        <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows="4" className="w-full p-3 border border-gray-300 rounded-lg shadow-sm resize-none focus:border-indigo-500 focus:ring-indigo-500 transition" />
        
        <button 
          onClick={submit} 
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-xl hover:bg-indigo-700 transition duration-200 transform hover:scale-[1.005]"
        >
          Add New Product
        </button>
      </div>
    </div>
  )
}
