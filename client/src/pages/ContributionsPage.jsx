import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/apiClient';

export default function ContributionsPage() {
  const { auth } = useAuth();
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    async function fetchContributions() {
      const res = await api.get(`/contributions/member/${auth.userId}`);
      setContributions(res.data);
    }
    fetchContributions();
  }, [auth.userId]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Your Contributions</h1>
      <ul className="list-disc list-inside">
        {contributions.map((contrib, index) => (
          <li key={index}>
            ${contrib.amount} on {new Date(contrib.timestamp).toLocaleDateString()}
          </li>
        )) || <p>No contributions found.</p>}
      </ul>
    </div>
  );
}
