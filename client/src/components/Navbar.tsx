import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaUser } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setShowDropdown(false);
    navigate("/login");
  };

  const displayName = () => {
    if (!user) return "User";
    return user.username || user.email?.split("@")[0] || "User";
  };

  const isAdmin = user?.role === "admin";

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
          <Link to="/" className="hover:text-emerald-400 transition">Home</Link>
          <Link to="/about" className="hover:text-emerald-400 transition">About</Link>
          <Link to="/contact" className="hover:text-emerald-400 transition">Contact</Link>

          {isAuthenticated ? (
            <>
              <Link
                to={isAdmin ? "/admin" : "/member"}
                className="flex items-center gap-1 hover:text-emerald-400 transition"
              >
                <FaUser className="text-sm" />
                {isAdmin ? "Admin Dashboard" : "My Account"}
              </Link>

              {/* Avatar dropdown */}
              <div className="relative ml-4" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center uppercase font-semibold hover:bg-emerald-500 transition"
                >
                  {displayName().charAt(0)}
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-md overflow-hidden z-50">
                    <div className="px-4 py-3 border-b text-sm font-medium text-gray-800">
                      {displayName()}
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded text-sm transition">Login</Link>
              <Link to="/register" className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded text-sm transition">Register</Link>
            </>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <div className="md:hidden text-emerald-400">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 text-white px-4 py-4 space-y-3">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-emerald-400 py-1">Home</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-emerald-400 py-1">About</Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-emerald-400 py-1">Contact</Link>

          {isAuthenticated ? (
            <>
              <Link
                to={isAdmin ? "/admin" : "/member"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 hover:text-emerald-400 py-1"
              >
                <FaUser className="text-sm" />
                {isAdmin ? "Admin Dashboard" : "My Account"}
              </Link>

              <div className="mt-4 border-t border-gray-600 pt-3 text-left">
                <div className="text-sm text-gray-300 mb-1">{displayName()}</div>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block hover:text-emerald-400 py-1"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left hover:text-emerald-400 py-1"
                >
                  Logout
                </button>
              </div>
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
