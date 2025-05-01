import "./App.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./auth/Login";
import Register from "./auth/Register";

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

// import AdminInvitations from "./pages/admin/Invitations";
// import AdminReports from "./pages/admin/Reports";
// import AdminSettings from "./pages/admin/Settings";
// import AdminNotifications from "./pages/admin/Notifications";
// import AdminMessages from "./pages/admin/Messages";
// import AdminPayments from "./pages/admin/Payments";

// Member Pages
import MemberDashboard from "./pages/member/Dashboard";
import MemberGroups from "./pages/member/Groups";
import GroupDetails from "./pages/member/GroupDetails";
import CreateGroup from "./pages/member/CreateGroup";
import Contributions from "./pages/member/Contributions";
import Transactions from "./pages/member/Transactions";
import Loans from "./pages/member/Loans";


// import MyGroups from "./pages/member/MyGroups";
// import Investments from "./pages/member/Investments";
// import Meetings from "./pages/member/Meetings";
// import Invitations from "./pages/member/Invitations";
// import Reports from "./pages/member/Reports";
// import Settings from "./pages/member/Settings";
// import Notifications from "./pages/member/Notifications";
// import Messages from "./pages/member/Messages";
// import Payments from "./pages/member/Payments";

function App() {
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

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="AdminDashboard" element={<AdminDashboard />} />
              <Route path="AdminUsers" element={<AdminUsers />} />
              <Route path="AdminGroups" element={<AdminGroups />} />
              <Route path="AdminLoans" element={<AdminLoans />} />
              <Route path="AdminInvestments" element={<AdminInvestments />} />
              <Route path="AdminMeetings" element={<AdminMeetings />} />
              <Route path="AdminTransactions" element={<AdminTransactions />} />
              <Route path="AdminContributions" element={<AdminContributions />} />
              {/* 
              <Route path="invitations" element={<AdminInvitations />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="payments" element={<AdminPayments />} />
              */}
            </Route>

            {/* Member Routes */}
            <Route path="/member" element={<MemberLayout />}>
              <Route path="dashboard" element={<MemberDashboard />} />
              <Route path="groups" element={<MemberGroups />} />
              <Route path="groups/:id" element={<GroupDetails />} />
              <Route path="create-group" element={<CreateGroup />} />
              <Route path="contributions" element={<Contributions />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="loans" element={<Loans />} />
              {/* 
              <Route path="my-groups" element={<MyGroups />} />
              <Route path="investments" element={<Investments />} />
              <Route path="meetings" element={<Meetings />} />
              <Route path="invitations" element={<Invitations />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="messages" element={<Messages />} />
              <Route path="payments" element={<Payments />} />
              */}
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
