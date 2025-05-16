import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiPlus } from 'react-icons/fi';
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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    note: '',
    receipt_number: '',
    group_id: '',
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const fetchContributions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/contributions/', {
        withCredentials: true,
      });
      setContributions(res.data);
    } catch (err) {
      console.error('Failed to fetch contributions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this contribution?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/contributions/${id}`, {
        withCredentials: true,
      });
      toast.success('Contribution deleted');
      fetchContributions();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/contributions/${id}`,
        { status },
        { withCredentials: true }
      );
      toast.success(`Marked as ${status}`);
      fetchContributions();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (editId !== null) {
        await axios.put(
          `http://localhost:5000/api/contributions/${editId}`,
          {
            ...formData,
            amount: parseFloat(formData.amount),
          },
          { withCredentials: true }
        );
        toast.success('Contribution updated');
      } else {
        await axios.post(
          'http://localhost:5000/api/contributions/',
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

  const handleEdit = (c: Contribution) => {
    setEditId(c.id);
    setFormData({
      amount: String(c.amount),
      note: c.note || '',
      receipt_number: c.receipt_number || '',
      group_id: String(c.group_id),
    });
    setShowForm(true);
  };

  const filtered = contributions.filter(
    (c) =>
      (user?.role === 'admin' || c.member_id === user?.id) &&
      (c.member_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  useEffect(() => {
    fetchContributions();
  }, []);

  const badgeColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

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
        <form onSubmit={handleSubmit} className="bg-white shadow rounded p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="text"
              name="receipt_number"
              placeholder="Receipt Number"
              value={formData.receipt_number}
              onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="text"
              name="group_id"
              placeholder="Group ID"
              value={formData.group_id}
              onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
              className="border px-3 py-2 rounded w-full"
              required
            />
          </div>
          <textarea
            name="note"
            placeholder="Note (optional)"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          />
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

      <div className="overflow-x-auto rounded shadow">
        <table className="min-w-full bg-white border">
          <thead className="bg-emerald-700 text-white">
            <tr>
              <th className="py-2 px-4">#</th>
              <th className="py-2 px-4">Member</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Note</th>
              <th className="py-2 px-4">Receipt</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((c, i) => (
              <tr key={c.id} className="border-b hover:bg-emerald-50">
                <td className="py-2 px-4">{(currentPage - 1) * pageSize + i + 1}</td>
                <td className="py-2 px-4">{c.member_name || '—'}</td>
                <td className="py-2 px-4">{c.amount.toLocaleString()}</td>
                <td className="py-2 px-4">{c.note || '—'}</td>
                <td className="py-2 px-4">{c.receipt_number || '—'}</td>
                <td className="py-2 px-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${badgeColor[c.status]}`}>
                    {c.status}
                  </span>
                </td>
                <td className="py-2 px-4">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="py-2 px-4 space-x-2">
                  {(user?.role === 'admin' || c.member_id === user?.id) && (
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(c)}
                    >
                      <FiEdit2 />
                    </button>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <button
                        className="text-green-600 hover:text-green-800"
                        onClick={() => handleUpdateStatus(c.id, 'confirmed')}
                      >
                        <FiCheckCircle />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleUpdateStatus(c.id, 'rejected')}
                      >
                        <FiXCircle />
                      </button>
                    </>
                  )}
                  {(user?.role === 'admin' || c.member_id === user?.id) && (
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(c.id)}
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1
                  ? 'bg-emerald-700 text-white'
                  : 'border-emerald-700 text-emerald-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ContributionTable;
