// src/pages/member/MemberDashboard.tsx

import MemberStatCard from "../../components/member/MemberStatCard";
import { useEffect, useState } from "react";

const MemberDashboard = () => {
  const [stats, setStats] = useState({
    contributions: 0,
    loans: 0,
    payments: 0,
    balance: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/member/summary");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch member stats", error);
      }
    };

    fetchStats();
  }, []);

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
