import React, { useState } from 'react';


interface Contribution {
  id: number;
  member_id: number;
  member_name?: string;
  amount: number;
  status: string;
  date: string;
  note?: string;
  receipt_number?: string;
}

interface Props {
  contributions: Contribution[] | undefined | null;
  onStatusChange?: (id: number, status: string) => void;
  isAdmin?: boolean;
}

const ContributionTable: React.FC<Props> = ({
  contributions = [],
  onStatusChange,
  isAdmin = false,
}) => {
  const [filterText, setFilterText] = useState('');

  const filteredContributions = Array.isArray(contributions)
    ? contributions.filter((c) =>
        `${c.member_name || ''} ${c.status} ${c.receipt_number || ''}`
          .toLowerCase()
          .includes(filterText.toLowerCase())
      )
    : [];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="🔍 Filter contributions..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="px-3 py-2 border rounded w-full md:w-1/2"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              {isAdmin && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredContributions.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {c.member_name || `Member ${c.member_id}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${c.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      c.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : c.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(c.date).toLocaleDateString()}
                </td>
                {isAdmin && onStatusChange && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    {c.status !== 'confirmed' && (
                      <button
                        onClick={() => onStatusChange(c.id, 'confirmed')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                    )}
                    {c.status !== 'rejected' && (
                      <button
                        onClick={() => onStatusChange(c.id, 'rejected')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredContributions.length === 0 && (
        <div className="p-4 text-center text-gray-500">No contributions found</div>
      )}
    </div>
  );
};

export default ContributionTable;
