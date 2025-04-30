import { Link } from 'react-router-dom';
import { 
  UserGroupIcon, 
  UsersIcon, 
  CashIcon, 
  DocumentReportIcon 
} from '@heroicons/react/outline';

const SuperAdminDashboard = () => {
  const stats = [
    { id: 1, name: 'Total Groups', value: '42', icon: UserGroupIcon },
    { id: 2, name: 'Total Members', value: '1,234', icon: UsersIcon },
    { id: 3, name: 'Total Contributions', value: 'KES 12.8M', icon: CashIcon },
    { id: 4, name: 'Active Loans', value: 'KES 3.2M', icon: DocumentReportIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        
        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <item.icon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.name}
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {item.value}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quick Actions
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              <Link
                to="/dashboard/users/create"
                className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition"
              >
                <h4 className="font-medium text-blue-800">Create New User</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Add new members or admins to the system
                </p>
              </Link>
              <Link
                to="/dashboard/groups/create"
                className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition"
              >
                <h4 className="font-medium text-green-800">Create New Group</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Set up a new savings group
                </p>
              </Link>
              <Link
                to="/dashboard/reports"
                className="bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition"
              >
                <h4 className="font-medium text-purple-800">Generate Reports</h4>
                <p className="text-sm text-gray-500 mt-1">
                  View system-wide financial reports
                </p>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
          </div>
          <div className="border-t border-gray-200">
            {/* Activity list would go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;