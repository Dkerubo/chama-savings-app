import { useEffect } from "react";
import "./App.scss";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";

function App() {
  // Add this useEffect hook to unregister service workers
  useEffect(() => {
    if (import.meta.env.MODE === "development") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations()
          .then(registrations => {
            registrations.forEach(registration => {
              registration.unregister();
              console.log("ServiceWorker unregistered:", registration.scope);
            });
          })
          .catch(error => {
            console.error("ServiceWorker unregistration failed:", error);
          });
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;