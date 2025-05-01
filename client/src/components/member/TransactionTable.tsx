import React from "react";

type Transaction = {
  id: number;
  type: string; // e.g., 'Loan Payment', 'Contribution'
  amount: number;
  date: string;
  status: string;
};

interface Props {
  transactions: Transaction[];
}

const TransactionTable: React.FC<Props> = ({ transactions }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
      {transactions.length > 0 ? (
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">Amount</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td className="border px-4 py-2">{txn.id}</td>
                <td className="border px-4 py-2">{txn.type}</td>
                <td className="border px-4 py-2">KES {txn.amount}</td>
                <td className="border px-4 py-2">{txn.date}</td>
                <td className="border px-4 py-2">{txn.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No transactions found.</p>
      )}
    </div>
  );
};

export default TransactionTable;
