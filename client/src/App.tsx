// src/App.tsx
import "./App.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from 'react-hot-toast';

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

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import MemberLayout from "./layouts/MemberLayout";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminGroups from "./pages/admin/AdminGroups";
import AdminLoans from "./pages/admin/AdminLoans";
import AdminInvestments from "./pages/admin/AdminInvestments";
import AdminMeetings from "./pages/admin/AdminMeetings";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminContributions from "./pages/admin/AdminContributions";

// Member Pages
import MemberDashboard from "./pages/member/Dashboard";
import MemberGroups from "./pages/member/Groups";
import GroupDetails from "./pages/member/GroupDetails";
import CreateGroup from "./pages/member/CreateGroup";
import Contributions from "./pages/member/Contributions";
import Transactions from "./pages/member/Transactions";
import Loans from "./pages/member/Loans";
//import Profile from "./pages/member/Profile";

function App() {
  return (
    
    <AuthProvider>
      <Router>
      <Toaster position="top-right" reverseOrder={false} />
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
              <Route path="/logout" element={<Logout />} />
              

              {/* Admin Routes - Protected with admin role */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin', 'superadmin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="groups" element={<AdminGroups />} />
                <Route path="loans" element={<AdminLoans />} />
                <Route path="investments" element={<AdminInvestments />} />
                <Route path="meetings" element={<AdminMeetings />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="contributions" element={<AdminContributions />} />
                {/* <Route path="/profile" element={<Profile />} /> */}
                
              </Route>

              {/* Member Routes - Protected (any authenticated user) */}
              <Route
                path="/member"
                element={
                  <ProtectedRoute>
                    <MemberLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<MemberDashboard />} />
                <Route path="dashboard" element={<MemberDashboard />} />
                <Route path="groups" element={<MemberGroups />} />
                <Route path="groups/:id" element={<GroupDetails />} />
                <Route path="create-group" element={<CreateGroup />} />
                <Route path="contributions" element={<Contributions />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="loans" element={<Loans />} />
                {/* <Route path="/profile" element={<Profile />} /> */}
              </Route>

              {/* Catch-all route for unauthorized/not found */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;