import React, { useState } from 'react';

export interface Contribution {
  id: number;
  member_id: number;
  member_name?: string;
  amount: number;
  status: string;
  date: string;
  note: string;
  receipt_number: string;
}

interface Props {
  contributions: Contribution[] | undefined | null;
}

const ContributionTable: React.FC<Props> = ({ contributions }) => {
  const [filterText, setFilterText] = useState('');

  const isValidArray = Array.isArray(contributions);

  const filteredContributions = isValidArray
    ? contributions.filter((c) =>
        `${c.member_name || ''} ${c.status} ${c.receipt_number}`
          .toLowerCase()
          .includes(filterText.toLowerCase())
      )
    : [];

  return (
    <div className="w-full p-4 bg-white shadow-md rounded-lg">
      <div className="mb-4 flex items-center justify-start">
        <input
          type="text"
          placeholder="🔍 Filter by member, status or receipt #"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="px-4 py-2 w-full md:w-1/3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <table className="table w-full border border-gray-300 rounded-md overflow-hidden">
        <thead className="bg-emerald-700 text-white">
          <tr>
            <th>ID</th>
            <th>Member</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Note</th>
            <th>Receipt #</th>
          </tr>
        </thead>
        <tbody>
          {filteredContributions.length > 0 ? (
            filteredContributions.map((c) => (
              <tr key={c.id} className="hover:bg-emerald-50 text-sm">
                <td className="px-2 py-2">{c.id}</td>
                <td className="px-2 py-2">{c.member_name || c.member_id}</td>
                <td className="px-2 py-2">{c.amount}</td>
                <td className="px-2 py-2">{c.status}</td>
                <td className="px-2 py-2">{new Date(c.date).toLocaleDateString()}</td>
                <td className="px-2 py-2">{c.note}</td>
                <td className="px-2 py-2">{c.receipt_number}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-500">
                No contributions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ContributionTable;
