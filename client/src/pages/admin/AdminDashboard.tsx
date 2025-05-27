import { useEffect, useState } from "react";
import AdminStatCard from "../../components/admin/AdminStatCard";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    loans: 0,
    contributions: 0,
    payments: 0,
  });

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found. Admin must be logged in.");
        return;
      }

      const response = await fetch("/api/admin/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("Content-Type");

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setStats(data);
      } else {
        throw new Error("Invalid response format (expected JSON)");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-emerald-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard title="Total Users" value={stats.users} icon="users" />
        <AdminStatCard title="Active Loans" value={stats.loans} icon="loans" />
        <AdminStatCard
          title="Total Contributions"
          value={stats.contributions}
          icon="contributions"
        />
        <AdminStatCard
          title="Total Payments"
          value={stats.payments}
          icon="payments"
        />
      </div>

      {/* Add charts, activity feed, or announcements below */}
    </div>
  );
};

export default AdminDashboard;
