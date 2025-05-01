import { useEffect, useState } from "react";

const AdminInvestments = () => {
  const [investments, setInvestments] = useState([]);

  const fetchInvestments = async () => {
    try {
      const res = await fetch("/api/admin/investments");
      const data = await res.json();
      setInvestments(data);
    } catch (error) {
      console.error("Error fetching investments:", error);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Investments</h1>

      <div className="bg-white rounded-lg shadow p-4">
        {investments.length > 0 ? (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Group</th>
                <th className="border px-4 py-2">Type</th>
                <th className="border px-4 py-2">Amount</th>
                <th className="border px-4 py-2">Start Date</th>
                <th className="border px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((investment: any) => (
                <tr key={investment.id}>
                  <td className="border px-4 py-2">{investment.id}</td>
                  <td className="border px-4 py-2">{investment.groupName}</td>
                  <td className="border px-4 py-2">{investment.type}</td>
                  <td className="border px-4 py-2">{investment.amount}</td>
                  <td className="border px-4 py-2">{investment.startDate}</td>
                  <td className="border px-4 py-2">{investment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No investments found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminInvestments;
