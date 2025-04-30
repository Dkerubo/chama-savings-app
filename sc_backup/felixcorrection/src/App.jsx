import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
// import ProtectedRoute from './components/ProtectedRoute';
// import DashboardLayout from './components/DashboardLayout';

// Main Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';

// Dashboard Pages
// import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
// import MemberDashboard from './pages/dashboard/MemberDashboard';
// import GroupManagement from './pages/dashboard/GroupManagement';
// import UserManagement from './pages/dashboard/UserManagement';
// import Contributions from './pages/dashboard/Contributions';
// import Loans from './pages/dashboard/Loans';
// import CreateGroup from './pages/dashboard/CreateGroup';
// import InviteMembers from './pages/dashboard/InviteMembers';
// import LoanApplicationComponent from './pages/dashboard/LoanApplicationComponent';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-6">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Protected Dashboard Routes */}
              <Route 
                // path="/dashboard" 
                // element={
                //   <ProtectedRoute>
                //     <DashboardLayout />
                //   </ProtectedRoute>
                // }
              >
                {/* Super Admin Routes */}
                {/* <Route path="superadmin" element={<SuperAdminDashboard />} />
                <Route path="groups" element={<GroupManagement />} />
                <Route path="users" element={<UserManagement />} /> */}
                
                {/* Member Routes */}
                {/* <Route index element={<MemberDashboard />} />
                <Route path="my-group" element={<GroupManagement />} />
                <Route path="contributions" element={<Contributions />} />
                <Route path="loans" element={<Loans />} />
                <Route path="loans/apply" element={<LoanApplicationComponent/>} />
                <Route path="groups/create" element={<CreateGroup />} />
                <Route path="invite" element={<InviteMembers />} /> */}
              </Route>
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;