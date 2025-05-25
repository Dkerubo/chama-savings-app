// src/App.tsx
import "./App.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { GroupApiProvider } from "./context/GroupApiContext";
import { NotificationProvider } from "./context/NotificationContext";

// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Logout from "./auth/Logout";
import Unauthorized from "./pages/Unauthorized"; // Make sure this page exists

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import MemberLayout from "./layouts/MemberLayout";

import { lazy, Suspense } from 'react';
// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";

// Member Pages
import MemberDashboard from "./pages/member/Dashboard";
import CreateGroup from "./pages/member/CreateGroup";
import Contributions from "./pages/member/Contributions";
import Profile from "./pages/member/Profile";

function App() {
  return (
    <AuthProvider>
      <GroupApiProvider>
        <NotificationProvider>
          <Router>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="flex flex-col min-h-screen w-full">
              <Navbar />
              <main className="flex-grow">
                <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/logout" element={<Logout />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* Admin Routes - admin or superadmin */}
                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute roles={['admin', 'superadmin']}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                  </Route>

                  {/* Member Routes - any logged-in user */}
                  <Route
                    path="/member/*"
                    element={
                      <ProtectedRoute roles={['member']}>
                        <MemberLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<MemberDashboard />} />
                    <Route path="dashboard" element={<MemberDashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="create-group" element={<CreateGroup />} />
                    <Route path="contributions" element={<Contributions />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Home />} />
                </Routes>
                  </Suspense>
              </main>
              <Footer />
            </div>
          </Router>
        </NotificationProvider>
      </GroupApiProvider>
    </AuthProvider>
  );
}

export default App;
