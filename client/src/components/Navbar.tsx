import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const getDisplayName = () => {
    if (!user) return 'User';
    return user.username || (user.email ? user.email.split('@')[0] : 'User');
  };

  return (
    <header className="w-full bg-gray-900 shadow-md z-50">
      <div className="max-w-[85rem] mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/assets/logos/chamayetu-logo-white.png"
            alt="Chamayetu Logo"
            className="h-12 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-white">
          <Link to="/" className="hover:text-emerald-400 transition">
            Home
          </Link>
          <Link to="/about" className="hover:text-emerald-400 transition">
            About
          </Link>
          <Link to="/contact" className="hover:text-emerald-400 transition">
            Contact
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'admin' || user?.role === 'superadmin' ? (
                <Link 
                  to="/admin" 
                  className="flex items-center gap-1 hover:text-emerald-400 transition"
                >
                  <FaUser className="text-sm" />
                  Admin Dashboard
                </Link>
              ) : (
                <Link 
                  to="/member" 
                  className="flex items-center gap-1 hover:text-emerald-400 transition"
                >
                  <FaUser className="text-sm" />
                  My Account
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 hover:text-emerald-400 transition"
              >
                <FaSignOutAlt className="text-sm" />
                Logout
              </button>
              
              {user && (
                <span className="ml-2 text-emerald-300">
                  {getDisplayName()}
                </span>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded text-sm transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded text-sm transition"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden text-emerald-400">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="focus:outline-none"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 text-white px-4 py-4 space-y-3">
          <Link 
            to="/" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block hover:text-emerald-400 py-1"
          >
            Home
          </Link>
          <Link 
            to="/about" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block hover:text-emerald-400 py-1"
          >
            About
          </Link>
          <Link 
            to="/contact" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block hover:text-emerald-400 py-1"
          >
            Contact
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'admin' || user?.role === 'superadmin' ? (
                <Link 
                  to="/admin" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 hover:text-emerald-400 py-1"
                >
                  <FaUser className="text-sm" />
                  Admin Dashboard
                </Link>
              ) : (
                <Link 
                  to="/member" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 hover:text-emerald-400 py-1"
                >
                  <FaUser className="text-sm" />
                  My Account
                </Link>
              )}
              
              {user && (
                <div className="py-2 border-t border-gray-700 mt-2">
                  <span className="text-emerald-300">
                    Welcome, {getDisplayName()}
                  </span>
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full hover:text-emerald-400 py-1 mt-2"
              >
                <FaSignOutAlt className="text-sm" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-emerald-700 hover:bg-emerald-600 rounded px-4 py-2 text-sm mt-2"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-emerald-700 hover:bg-emerald-600 rounded px-4 py-2 text-sm mt-2"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}