import { useEffect, useState } from "react";

const Contributions = () => {
  const [contributions, setContributions] = useState([]);
  const [amount, setAmount] = useState("");

  const fetchContributions = async () => {
    const res = await fetch("/api/contributions");
    const data = await res.json();
    setContributions(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    if (res.ok) {
      setAmount("");
      fetchContributions();
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Contributions</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="border p-2 rounded w-full"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Contribute
          </button>
        </div>
      </form>

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Contribution History</h2>
        <table className="w-full text-left border">
          <thead>
            <tr>
              <th className="border-b p-2">Amount</th>
              <th className="border-b p-2">Date</th>
              <th className="border-b p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map((c: any, idx: number) => (
              <tr key={idx}>
                <td className="border-b p-2">{c.amount}</td>
                <td className="border-b p-2">{new Date(c.date).toLocaleDateString()}</td>
                <td className="border-b p-2">{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Contributions;