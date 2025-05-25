// src/components/contributions/ContributionTable.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiPlus } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Contribution {
  id: number;
  member_id: number;
  group_id: number;
  amount: number;
  note: string;
  created_at: string;
  status: 'pending' | 'confirmed' | 'rejected';
  receipt_number: string;
  member_name: string | null;
}

interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

const ContributionTable = () => {
  const auth = useAuth();
  const user = auth.user as AuthUser | null;
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    note: '',
    receipt_number: '',
    group_id: '',
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE = 'https://chama-savings-app.onrender.com/api/contributions';

  const fetchContributions = async () => {
    try {
      const res = await axios.get(API_BASE, {
        withCredentials: true,
      });
      setContributions(res.data);
    } catch (err) {
      console.error('Failed to fetch contributions:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (editId !== null) {
        await axios.put(
          `${API_BASE}/${editId}`,
          {
            ...formData,
            amount: parseFloat(formData.amount),
          },
          { withCredentials: true }
        );
        toast.success('Contribution updated');
      } else {
        await axios.post(
          API_BASE,
          {
            ...formData,
            member_id: user.id,
            amount: parseFloat(formData.amount),
          },
          { withCredentials: true }
        );
        toast.success('Contribution submitted');
      }
      setFormData({ amount: '', note: '', receipt_number: '', group_id: '' });
      setShowForm(false);
      setEditId(null);
      fetchContributions();
    } catch (err) {
      toast.error('Submission failed');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const filteredContributions = contributions.filter((c) =>
    (c.member_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-emerald-700">Contributions</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-2 py-1 rounded text-sm"
          />
          {user?.id && (
            <button
              className="bg-emerald-700 text-white px-3 py-1 rounded flex items-center gap-1"
              onClick={() => {
                setEditId(null);
                setShowForm(!showForm);
              }}
            >
              <FiPlus /> Contribute
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded p-4 mb-4 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (KES)
              </label>
              <input
                type="number"
                name="amount"
                placeholder="e.g. 1000"
                required
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="border px-3 py-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Number
              </label>
              <input
                type="text"
                name="receipt_number"
                placeholder="e.g. MPESA123ABC"
                value={formData.receipt_number}
                onChange={(e) =>
                  setFormData({ ...formData, receipt_number: e.target.value })
                }
                className="border px-3 py-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group ID
              </label>
              <input
                type="text"
                name="group_id"
                placeholder="e.g. 1"
                value={formData.group_id}
                onChange={(e) =>
                  setFormData({ ...formData, group_id: e.target.value })
                }
                className="border px-3 py-2 rounded w-full"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              name="note"
              placeholder="e.g. Monthly savings for May"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="border px-3 py-2 rounded w-full"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800"
            >
              {editId ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      )}

      {/* Render the contributions table */}
      <div className="bg-white shadow rounded">
        <table className="min-w-full table-auto border text-sm">
          <thead className="bg-emerald-100">
            <tr>
              <th className="px-4 py-2 text-left">Member</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Receipt</th>
              <th className="px-4 py-2 text-left">Note</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredContributions.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2">{c.member_name || 'N/A'}</td>
                <td className="px-4 py-2">{c.amount}</td>
                <td className="px-4 py-2">{c.receipt_number}</td>
                <td className="px-4 py-2">{c.note}</td>
                <td className="px-4 py-2 capitalize">{c.status}</td>
                <td className="px-4 py-2">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContributionTable;
