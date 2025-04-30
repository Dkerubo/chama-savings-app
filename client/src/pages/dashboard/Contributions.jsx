import { useState, useEffect } from 'react';
import { CashIcon, CalendarIcon, UserIcon } from '@heroicons/react/outline';
import {
  getGroupContributions,
  createContribution,
  updateContribution
} from '../../services/contributionService';

const Contributions = ({ groupId }) => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const data = await getGroupContributions(groupId);
        setContributions(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch contributions');
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newContribution = await createContribution(groupId, formData);
      setContributions([...contributions, newContribution]);
      setFormData({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to add contribution');
    }
  };

  const handleVerify = async (contributionId) => {
    try {
      const updated = await updateContribution(groupId, contributionId, { status: 'paid' });
      setContributions(contributions.map(c =>
        c.id === contributionId ? updated : c
      ));
    } catch (err) {
      setError(err.message || 'Failed to verify contribution');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contributions</h1>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 shadow rounded">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="number"
            name="amount"
            placeholder="Amount (KES)"
            value={formData.amount}
            onChange={e => setFormData({ ...formData, amount: e.target.value })}
            required
            className="border p-2 rounded w-full"
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            name="notes"
            placeholder="Notes (Optional)"
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            className="border p-2 rounded w-full"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Contribution
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contributions.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CashIcon className="h-5 w-5 text-gray-400" />
                      <span className="ml-2 text-sm text-gray-900">KES {Number(c.amount).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <span className="ml-2 text-sm text-gray-500">{new Date(c.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.notes || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      c.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {c.status?.charAt(0).toUpperCase() + c.status?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.status !== 'paid' && (
                      <button
                        onClick={() => handleVerify(c.id)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Contributions;
