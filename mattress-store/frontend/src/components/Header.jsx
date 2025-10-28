import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
// Relying on user's existing files for these imports
import { CartContext } from '../context/CartContext'; 
import AuthForm from "./AuthForm"; 
import { Menu, X, ShoppingCart, User, Search, Home, DollarSign, LogOut } from 'lucide-react';

// Define the categories for the side menu
const CATEGORIES = [
    "Prayer Mat",
    "Tasbeeh",
    "Digital Tasbeeh Counter",
    "Attar & Perfume",
    "Quran Box",
    "Imama Sharif",
    "Haji Rumal"
];

export default function Header() { 
    // Get cart, user, and the global logout function from context
    const { cart, user, logout } = useContext(CartContext); 
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    const isAdmin = user?.isAdmin; // Safely check for admin status

    const [showAuth, setShowAuth] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // State for the mobile slide-out menu

    // Helper to convert category name to URL slug
    const categoryToSlug = (category) => encodeURIComponent(category.replace(/ /g, '-').toLowerCase());

    const navItems = [
        { name: "Home", to: "/", icon: Home, requiresAuth: false },
        { name: "Shop All", to: "/shop", icon: ShoppingCart, requiresAuth: false },
        { name: "Order History", to: "/history", icon: DollarSign, requiresAuth: true },
        // Admin link only appears if the user is logged in and is admin
        ...(isAdmin ? [{ name: "Admin Panel", to: "/admin/products", icon: User, requiresAuth: true }] : []),
    ];

    const MenuLink = ({ to, children, icon: Icon, onClick }) => (
        <Link 
            to={to} 
            onClick={() => { onClick?.(); setIsMenuOpen(false); }}
            className="flex items-center space-x-3 p-3 text-lg font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
        >
            <Icon className="w-5 h-5 text-indigo-500" />
            <span>{children}</span>
        </Link>
    );

    return (
        <>
            {/* 1. Top Announcement Bar */}
            <div className="bg-indigo-600 text-white text-center text-xs py-2 hidden sm:block">
                Free Shipping on all orders above $50. Use code **FIRDOUSI50**.
            </div>

            {/* 2. Main Fixed Header Bar */}
            <header className="sticky top-0 left-0 right-0 z-20 bg-white shadow-md border-b border-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                    
                    {/* Left Side: Menu/Hamburger (Mobile) */}
                    <button 
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2 rounded-full text-gray-600 hover:bg-gray-100 sm:hidden transition-colors duration-200"
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Left Side: Shop Links (Desktop) */}
                    <nav className="hidden sm:flex items-center space-x-6 text-sm font-medium">
                        <MenuLink to="/" icon={Home}>Home</MenuLink>
                        <MenuLink to="/shop" icon={ShoppingCart}>Shop</MenuLink>
                        
                        {/* Desktop Search Icon */}
                        <Link 
                            to="/shop?search=" 
                            className="text-gray-600 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                            aria-label="Search"
                        >
                            <Search className="w-5 h-5" />
                        </Link>
                    </nav>

                    {/* Center: Logo / Brand Name (Visible on all sizes) */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 sm:static sm:transform-none">
                        <Link to="/" className="text-2xl md:text-3xl font-extrabold text-indigo-700 tracking-tight flex items-center gap-1 transition-colors duration-200 hover:text-indigo-500">
                             {/* Unicode for minaret/mosque/islamic pattern */}
                            <span className="text-2xl hidden sm:inline">🕌</span> 
                            <span className="text-xl sm:text-2xl">Firdousi</span>
                        </Link>
                    </div>

                    {/* Right Side: Actions (Cart, User/Login) */}
                    <div className="flex items-center space-x-2 md:space-x-4">
                        
                         {/* Desktop Search Icon */}
                        <Link 
                            to="/shop?search=" 
                            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hidden sm:block transition-colors duration-200"
                            aria-label="Search"
                        >
                            <Search className="w-6 h-6" />
                        </Link>

                        {/* Cart Link with Badge */}
                        <Link 
                            to="/cart" 
                            className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                            aria-label="Shopping Cart"
                        >
                            <ShoppingCart className="w-6 h-6 text-gray-700" />
                            {count > 0 && (
                                <span 
                                    className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full ring-2 ring-white"
                                >
                                    {count > 99 ? '99+' : count}
                                </span>
                            )}
                        </Link>

                        {/* User / Login Button */}
                        {user ? (
                            <button 
                                onClick={logout} 
                                className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors duration-200 hidden sm:block"
                                aria-label="Logout"
                            >
                                <LogOut className="w-6 h-6" />
                            </button>
                        ) : (
                            <button 
                                onClick={() => setShowAuth(true)} 
                                className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                                aria-label="Login / Register"
                            >
                                <User className="w-6 h-6" />
                            </button>
                        )}
                        
                    </div>
                </div>
            </header>

            {/* --- Mobile Side Menu (Ajmal-style slide out) --- */}
            <div 
                className={`fixed top-0 left-0 h-full w-full bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => setIsMenuOpen(false)}
            >
                <div 
                    className={`bg-white w-64 h-full shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    onClick={(e) => e.stopPropagation()} // Keep menu open when clicking inside
                >
                    <div className="p-4 border-b flex justify-between items-center">
                        <div className="text-xl font-bold text-indigo-700">Navigation</div>
                        <button 
                            onClick={() => setIsMenuOpen(false)}
                            className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
                            aria-label="Close menu"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="p-4 space-y-2">
                        {/* Primary Links */}
                        {navItems.map(item => {
                            // Hide authenticated links if user is not logged in
                            if (item.requiresAuth && !user) return null; 
                            return (
                                <MenuLink key={item.name} to={item.to} icon={item.icon}>
                                    {item.name}
                                </MenuLink>
                            );
                        })}
                        
                        {/* Conditional Auth/Logout */}
                        {user ? (
                            <button
                                onClick={() => { logout(); setIsMenuOpen(false); }}
                                className="flex items-center space-x-3 p-3 text-lg font-medium w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Logout ({user.email || 'User'})</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => { setShowAuth(true); setIsMenuOpen(false); }}
                                className="flex items-center space-x-3 p-3 text-lg font-medium w-full text-left text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                                <User className="w-5 h-5" />
                                <span>Login / Register</span>
                            </button>
                        )}
                        
                        <div className="pt-4 border-t mt-4">
                            <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase">Categories</h4>
                            <div className="space-y-1">
                                {CATEGORIES.map((cat) => (
                                    <Link
                                        key={cat}
                                        to={`/shop?category=${categoryToSlug(cat)}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        {cat}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </nav>
                </div>
            </div>


            {/* --- Modal for AuthForm --- */}
            {showAuth && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
                    onClick={() => setShowAuth(false)} 
                >
                    <div 
                        className="bg-white rounded-xl shadow-2xl p-6 relative max-w-md w-full"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <AuthForm onAuthSuccess={() => setShowAuth(false)} />
                        
                        <button 
                            onClick={() => setShowAuth(false)} 
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-900 transition-colors p-1"
                            aria-label="Close"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
