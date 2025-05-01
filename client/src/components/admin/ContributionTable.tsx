import React from "react";

type Contribution = {
  id: number;
  memberName: string;
  groupName: string;
  amount: number;
  date: string;
  status: string;
};

interface Props {
  contributions: Contribution[];
}

const ContributionTable: React.FC<Props> = ({ contributions }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 overflow-auto">
      {contributions.length > 0 ? (
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Member</th>
              <th className="border px-4 py-2">Group</th>
              <th className="border px-4 py-2">Amount</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map((c) => (
              <tr key={c.id}>
                <td className="border px-4 py-2">{c.id}</td>
                <td className="border px-4 py-2">{c.memberName}</td>
                <td className="border px-4 py-2">{c.groupName}</td>
                <td className="border px-4 py-2">KES {c.amount}</td>
                <td className="border px-4 py-2">{c.date}</td>
                <td className="border px-4 py-2">{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No contributions available.</p>
      )}
    </div>
  );
};

export default ContributionTable;
