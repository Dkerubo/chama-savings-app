import { useEffect, useState } from "react";

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const fetchLoans = async () => {
    const res = await fetch("/api/loans");
    const data = await res.json();
    setLoans(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, reason }),
    });
    if (res.ok) {
      setAmount("");
      setReason("");
      fetchLoans();
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Loan Requests</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Loan amount"
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason"
            className="border p-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Request Loan
        </button>
      </form>

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-2">My Loans</h2>
        <table className="w-full text-left border">
          <thead>
            <tr>
              <th className="border-b p-2">Amount</th>
              <th className="border-b p-2">Reason</th>
              <th className="border-b p-2">Status</th>
              <th className="border-b p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan: any, idx: number) => (
              <tr key={idx}>
                <td className="border-b p-2">{loan.amount}</td>
                <td className="border-b p-2">{loan.reason}</td>
                <td className="border-b p-2">{loan.status}</td>
                <td className="border-b p-2">{new Date(loan.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Loans;