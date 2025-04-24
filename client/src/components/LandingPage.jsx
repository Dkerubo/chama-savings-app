import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-cover bg-no-repeat bg-right md:bg-center" style={{ backgroundImage: "url('/homepage.jpg')" }}>
      <nav className="flex justify-between items-center p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-green-700">Chama Yetu</h1>
        <div className="space-x-4">
          <button onClick={() => navigate('/login')} className="text-green-700 hover:underline">Sign In</button>
          <button onClick={() => navigate('/register')} className="text-green-700 hover:underline">Register</button>
        </div>
      </nav>
      <div className="flex-1 flex items-center px-8 md:px-20 bg-gradient-to-l from-white/90 to-transparent">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">Welcome to Chama Yetu App</h2>
          <p className="text-lg text-gray-700 mb-8">
            Manage your group's contributions, loans, and activities seamlessly with the Chama Yetu app. Whether you're starting a new chama or joining one, we've got you covered.
          </p>
          <div className="space-x-4">
            <button onClick={() => navigate('/about')} className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition">Learn More</button>
            <button onClick={() => navigate('/login')} className="px-6 py-2 border border-green-700 text-green-700 rounded hover:bg-green-100 transition">Sign In</button>
            <button onClick={() => navigate('/register')} className="px-6 py-2 border border-green-700 text-green-700 rounded hover:bg-green-100 transition">Register</button>
          </div>
        </div>
      </div>
    </div>
  );
}
