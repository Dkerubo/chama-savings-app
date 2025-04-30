import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <nav className="hidden md:flex items-center gap-8 text-white">
          <Link to="/" className="hover:text-emerald-400 transition">
            Home
          </Link>
          <Link to="/about" className="hover:text-emerald-400 transition">
            About
          </Link>
          <Link to="/contact" className="hover:text-emerald-400 transition">
            Contact
          </Link>
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
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden text-emarald-400">
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
        <div className="md:hidden bg-gray-800 text-white px-4 py-4 space-y-2">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-emerald-400">
            Home
          </Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-emerald-400">
            About
          </Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-emerald-400">
            Contact
          </Link>
          <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block bg-emerald-700 hover:bg-emerald-600 rounded px-4 py-2 text-sm">
            Login
          </Link>
          <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block bg-emerald-700 hover:bg-emerald-600 rounded px-4 py-2 text-sm">
            Register
          </Link>
        </div>
      )}
    </header>
  );
}
