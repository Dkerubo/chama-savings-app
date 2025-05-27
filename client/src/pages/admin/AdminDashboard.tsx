import AdminStatCard from "../../components/admin/AdminStatCard";
import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    loans: 0,
    contributions: 0,
    payments: 0,
  });

  useEffect(() => {
    // Fetch summary stats from API
    const fetchStats = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/admin/summary", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    console.log("Raw response:", text); // <- see what you're getting
    const data = JSON.parse(text); // throws if not JSON

    setStats(data);
  } catch (error) {
    console.error("Failed to fetch dashboard stats", error);
  }
};

    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard title="Total Users" value={stats.users} icon="users" />
        <AdminStatCard title="Active Loans" value={stats.loans} icon="loans" />
        <AdminStatCard title="Total Contributions" value={stats.contributions} icon="contributions" />
        <AdminStatCard title="Total Payments" value={stats.payments} icon="payments" />
      </div>

      {/* Optional: charts or recent activity feed can go here */}
    </div>
  );
};

export default AdminDashboard;
