import React from "react";
import { BarChart3, Users, CreditCard, DollarSign } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon?: "users" | "loans" | "contributions" | "payments";
}

const iconMap = {
  users: <Users className="text-blue-600 w-6 h-6" />,
  loans: <CreditCard className="text-red-600 w-6 h-6" />,
  contributions: <BarChart3 className="text-green-600 w-6 h-6" />,
  payments: <DollarSign className="text-yellow-600 w-6 h-6" />,
};

const AdminStatCard: React.FC<Props> = ({ title, value, icon = "users" }) => {
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

export default AdminStatCard;
