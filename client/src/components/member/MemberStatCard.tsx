// src/components/member/MemberStatCard.tsx

import React from "react";
import { BarChart3, CreditCard, DollarSign, PiggyBank } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon?: "contributions" | "loans" | "payments" | "balance";
}

const iconMap = {
  contributions: <BarChart3 className="text-green-600 w-6 h-6" />,
  loans: <CreditCard className="text-red-600 w-6 h-6" />,
  payments: <DollarSign className="text-yellow-600 w-6 h-6" />,
  balance: <PiggyBank className="text-indigo-600 w-6 h-6" />,
};

const MemberStatCard: React.FC<Props> = ({ title, value, icon = "contributions" }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
      <div>
        <h4 className="text-sm text-gray-500">{title}</h4>
        <p className="text-xl font-semibold">{value}</p>
      </div>
      <div className="bg-gray-100 p-2 rounded-full">
        {iconMap[icon]}
      </div>
    </div>
  );
};

export default MemberStatCard;
