import { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  CheckIcon,
  XIcon,
  ClockIcon
} from '@heroicons/react/outline';
import { getLoans } from '../../services/loanService'; // Ensure this file exists

const Loans = ({ groupId }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const data = await getLoans(groupId);
        setLoans(data);
      } catch (error) {
        console.error('Error fetching loans:', error);
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchLoans();
    }
  }, [groupId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XIcon className="h-5 w-5 text-red-500" />;
      case 'repaid':
        return <CheckIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Loans Management</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Repayment Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          KES {loan.amount?.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {loan.date ? new Date(loan.date).toLocaleDateString() : '-'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {loan.member}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(loan.status)}
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                        loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        loan.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {loan.status?.charAt(0).toUpperCase() + loan.status?.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {loan.repayment ? new Date(loan.repayment).toLocaleDateString() : '-'}
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

export default Loans;
