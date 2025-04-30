import { Link } from 'react-router-dom';
import { 
  CashIcon, 
  DocumentTextIcon, 
  UserGroupIcon,
  PlusIcon
} from '@heroicons/react/outline';

const MemberDashboard = () => {
  const userGroups = [
    { id: 1, name: 'Family Savings', balance: 'KES 120,000', members: 12 },
    { id: 2, name: 'Investment Club', balance: 'KES 450,000', members: 8 },
  ];

  const recentContributions = [
    { id: 1, date: '2023-05-15', amount: 'KES 5,000', group: 'Family Savings' },
    { id: 2, date: '2023-05-10', amount: 'KES 10,000', group: 'Investment Club' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Member Dashboard</h1>
          <Link
            to="/dashboard/groups/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Create New Group
          </Link>
        </div>

        {/* My Groups */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">My Groups</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {userGroups.map((group) => (
              <div key={group.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <UserGroupIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        <Link to={`/dashboard/group/${group.id}`} className="hover:text-blue-600">
                          {group.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Balance: {group.balance}
                      </p>
                      <p className="text-sm text-gray-500">
                        Members: {group.members}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Contributions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Recent Contributions</h2>
          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {recentContributions.map((contribution) => (
                <li key={contribution.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CashIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                        <p className="ml-2 text-sm font-medium text-blue-600 truncate">
                          {contribution.amount}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {contribution.group}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="text-sm text-gray-500">
                          {contribution.date}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Link
            to="/dashboard/loans/apply"
            className="bg-white overflow-hidden shadow rounded-lg p-6 hover:bg-gray-50"
          >
            <div className="flex items-center">
              <DocumentTextIcon className="h-6 w-6 text-blue-500" />
              <h3 className="ml-3 text-sm font-medium text-gray-900">
                Apply for a Loan
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Submit a loan application from your group savings
            </p>
          </Link>
          <Link
            to="/dashboard/invite"
            className="bg-white overflow-hidden shadow rounded-lg p-6 hover:bg-gray-50"
          >
            <div className="flex items-center">
              <UserGroupIcon className="h-6 w-6 text-blue-500" />
              <h3 className="ml-3 text-sm font-medium text-gray-900">
                Invite Members
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Send invitations to join your group
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;