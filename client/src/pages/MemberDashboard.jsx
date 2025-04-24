import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/apiClient';

export default function MemberDashboard() {
  const { auth, logout } = useAuth();
  const [member, setMember] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [investments, setInvestments] = useState([]);

  // 1) Fetch the Member record to get member_id
  useEffect(() => {
    async function loadMember() {
      const res = await api.get(`/members/${auth.userId}`);
      setMember(res.data);
    }
    loadMember();
  }, [auth.userId]);

  // 2) Once we have member, fetch data
  useEffect(() => {
    if (!member) return;

    api.get(`/contributions/member/${member.id}`)
      .then(res => setContributions(res.data))
      .catch(console.error);

    api.get(`/loans/member/${member.id}`)
      .then(res => setLoans(res.data))
      .catch(console.error);

    api.get(`/investments?member_id=${member.id}`)
      .then(res => setInvestments(res.data))
      .catch(console.error);
  }, [member]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">
          Member Dashboard
        </h1>
        <button
          onClick={logout}
          className="py-1 px-3 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <section>
        <h2 className="text-xl font-semibold">Your Contributions</h2>
        <ul className="list-disc list-inside">
          {contributions.map(c => (
            <li key={c.id}>
              ${c.amount.toFixed(2)} on {new Date(c.timestamp).toLocaleDateString()}
            </li>
          )) || <p>No contributions yet.</p>}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Your Loans</h2>
        <ul className="list-disc list-inside">
          {loans.map(l => (
            <li key={l.id}>
              Loan #{l.id}: ${l.amount.toFixed(2)} – <em>{l.status}</em>
            </li>
          )) || <p>No loans.</p>}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Your Investments</h2>
        <ul className="list-disc list-inside">
          {investments.map(i => (
            <li key={i.id}>
              Investment #{i.id}: ${i.amount.toFixed(2)} – <em>{i.status}</em>
            </li>
          )) || <p>No investments.</p>}
        </ul>
      </section>
    </div>
  );
}
