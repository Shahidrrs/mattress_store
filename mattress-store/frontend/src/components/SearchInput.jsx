import React from 'react';
import { Search } from 'lucide-react'; // Using lucide-react for the icon

// Props:
// - searchTerm: The current value of the search input.
// - onSearchChange: The function to call when the input changes.
export default function SearchInput({ searchTerm, onSearchChange }) {
  return (
    <div className="relative w-full max-w-lg mx-auto mb-8 shadow-lg rounded-full">
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full py-3 pl-12 pr-4 text-gray-700 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
        <Search size={20} />
      </div>
    </div>
  );
}
