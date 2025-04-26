import { Routes, Route } from 'react-router-dom';
import GroupManagement from './pages/GroupManagement';
import ContributionsPage from './pages/ContributionsPage';
import LoansPage from './pages/LoansPage';
import MemberDashboard from './pages/MemberDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutUs from './pages/AboutUs';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<AboutUs />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/groups"
        element={
          <ProtectedRoute role="admin">
            <GroupManagement />
          </ProtectedRoute>
        }
      />

      {/* Protected Member Routes */}
      <Route
        path="/member"
        element={
          <ProtectedRoute role="member">
            <MemberDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/contributions"
        element={
          <ProtectedRoute role="member">
            <ContributionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/loans"
        element={
          <ProtectedRoute role="member">
            <LoansPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
