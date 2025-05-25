// src/pages/member/MemberDashboard.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import MemberStatCard from "../../components/member/MemberStatCard";
import { useAuth } from "../../context/AuthContext";

const MemberDashboard = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    contributions: 0,
    loans: 0,
    payments: 0,
    balance: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("https://chama-savings-app.onrender.com/api/member/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setStats(response.data);
      } catch (error: any) {
        console.error("❌ Failed to fetch member stats:", error);
        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Member Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MemberStatCard title="My Contributions" value={stats.contributions} icon="contributions" />
        <MemberStatCard title="My Loans" value={stats.loans} icon="loans" />
        <MemberStatCard title="My Payments" value={stats.payments} icon="payments" />
        <MemberStatCard title="Group Balance" value={`Ksh ${stats.balance}`} icon="balance" />
      </div>
    </div>
  );
};

export default MemberDashboard;
