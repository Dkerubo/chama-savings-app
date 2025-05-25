// src/App.tsx
import "./App.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { GroupApiProvider } from "./context/GroupApiContext";
import { NotificationProvider } from "./context/NotificationContext";
import { lazy, Suspense } from "react";

// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public Pages
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./auth/Login"));
const Register = lazy(() => import("./auth/Register"));
const Logout = lazy(() => import("./auth/Logout"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));

// Layouts
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const MemberLayout = lazy(() => import("./layouts/MemberLayout"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const CreateGroupPage = lazy(() => import("./pages/groups/CreateGroupPage")); // ✅ Fixed import
const ContributionsPage = lazy(() => import("./pages/member/Contributions")); // ✅ Renamed to match export

// Member Pages
const MemberDashboard = lazy(() => import("./pages/member/Dashboard"));
const CreateGroup = lazy(() => import("./pages/member/CreateGroup"));
const Contributions = lazy(() => import("./pages/member/Contributions"));
const Profile = lazy(() => import("./pages/member/Profile"));

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

                    {/* Admin Routes */}
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
                      <Route path="groups" element={<CreateGroupPage />} />
                      <Route path="contributions" element={<ContributionsPage />} />
                    </Route>

                    {/* Member Routes */}
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
