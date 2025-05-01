import React from "react";

type Loan = {
  id: number;
  memberName: string;
  groupName: string;
  amount: number;
  interest: number;
  dueDate: string;
  status: string;
};

interface Props {
  loans: Loan[];
}

const LoanTable: React.FC<Props> = ({ loans }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 overflow-auto">
      {loans.length > 0 ? (
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Loan ID</th>
              <th className="border px-4 py-2">Member</th>
              <th className="border px-4 py-2">Group</th>
              <th className="border px-4 py-2">Amount</th>
              <th className="border px-4 py-2">Interest (%)</th>
              <th className="border px-4 py-2">Due Date</th>
              <th className="border px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td className="border px-4 py-2">{loan.id}</td>
                <td className="border px-4 py-2">{loan.memberName}</td>
                <td className="border px-4 py-2">{loan.groupName}</td>
                <td className="border px-4 py-2">KES {loan.amount}</td>
                <td className="border px-4 py-2">{loan.interest}</td>
                <td className="border px-4 py-2">{loan.dueDate}</td>
                <td className="border px-4 py-2">{loan.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No loan records available.</p>
      )}
    </div>
  );
};

export default LoanTable;
