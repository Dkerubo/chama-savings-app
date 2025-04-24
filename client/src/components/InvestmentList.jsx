import { useEffect, useState } from 'react';
import api from '../api/apiClient';

export default function InvestmentList() {
  const [investments, setInvestments] = useState([]);

  useEffect(() => {
    api.get('/investments')
      .then(res => setInvestments(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      {investments.map(inv => (
        <div key={inv.id} className="p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold text-primary">
            Investment #{inv.id}
          </h3>
          <p>Amount: ${inv.amount.toFixed(2)}</p>
          <p>Paid: ${inv.total_paid.toFixed(2)}</p>
          <p>Status: <span className="font-medium">{inv.status}</span></p>
        </div>
      ))}
    </div>
  );
}
