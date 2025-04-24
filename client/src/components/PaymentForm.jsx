import { useState } from 'react';
import api from '../api/apiClient';

export default function PaymentForm({ onPayment }) {
  const [investmentId, setInvestmentId] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/investment_payments', {
        investment_id: +investmentId,
        amount: parseFloat(amount),
      });
      onPayment(res.data.investment);
      setInvestmentId('');
      setAmount('');
    } catch (err) {
      console.error(err);
      alert('Error adding payment');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Investment ID
        </label>
        <input
          type="number"
          value={investmentId}
          onChange={e => setInvestmentId(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded p-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded p-2"
          required
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-accent text-white rounded hover:bg-yellow-500"
      >
        Add Payment
      </button>
    </form>
  );
}
