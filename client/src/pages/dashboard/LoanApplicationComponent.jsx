// client/src/components/LoanApplicationComponent.js
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { applyGroupLoan } from '../../services/loanService';
import { getGroupMembers } from '../../services/groupService';
import { CurrencyDollarIcon } from '@heroicons/react/outline';

const LoanApplicationComponent = () => {
  const { groupId } = useParams();
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    repayment_period: '6',
    guarantor_id: '',
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getGroupMembers(groupId);
        setMembers(data);
      } catch (err) {
        setError('Failed to load group members.');
      }
    };
    fetchMembers();
  }, [groupId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await applyGroupLoan(groupId, {
        ...formData,
        amount: Number(formData.amount),
        repayment_period: Number(formData.repayment_period),
      });
      navigate(`/dashboard/groups/${groupId}/loans`);
    } catch (err) {
      setError(err.response?.data?.message || 'Loan application failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Loan Application</h1>
        <p className="text-sm text-gray-500 mb-6">
          Fill in the details below to apply for a loan.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Loan Amount (KES)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="amount"
                id="amount"
                required
                value={formData.amount}
                onChange={handleChange}
                className="pl-10 block w-full sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
              Loan Purpose
            </label>
            <input
              type="text"
              name="purpose"
              id="purpose"
              required
              value={formData.purpose}
              onChange={handleChange}
              className="block w-full sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="repayment_period" className="block text-sm font-medium text-gray-700">
              Repayment Period (months)
            </label>
            <input
              type="number"
              name="repayment_period"
              id="repayment_period"
              required
              value={formData.repayment_period}
              onChange={handleChange}
              min="1"
              max="36"
              className="block w-full sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="guarantor_id" className="block text-sm font-medium text-gray-700">
              Select Guarantor
            </label>
            <select
              name="guarantor_id"
              id="guarantor_id"
              required
              value={formData.guarantor_id}
              onChange={handleChange}
              className="block w-full sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select a guarantor --</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name || member.username}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanApplicationComponent;
