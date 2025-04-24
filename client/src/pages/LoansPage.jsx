import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/apiClient';

export default function LoansPage() {
  const { auth } = useAuth();
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    async function fetchLoans() {
      const res = await api.get(`/loans/member/${auth.userId}`);
      setLoans(res.data);
    }
    fetchLoans();
  }, [auth.userId]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Your Loans</h1>
      <ul className="list-disc list-inside">
        {loans.map((loan, index) => (
          <li key={index}>
            Loan #{loan.id}: ${loan.amount} – <em>{loan.status}</em>
          </li>
        )) || <p>No loans found.</p>}
      </ul>
    </div>
  );
}
