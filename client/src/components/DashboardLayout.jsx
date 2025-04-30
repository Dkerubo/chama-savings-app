import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  CashIcon, 
  DocumentTextIcon,
  CogIcon,
  LogoutIcon,
  UserIcon
} from '@heroicons/react/outline';

const DashboardLayout = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) navigate('/login');
    setUser(userData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-blue-800">
          <div className="flex items-center h-16 px-4 bg-blue-900">
            <span className="text-white font-bold text-xl">Chamayetu</span>
          </div>
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center px-4 pb-2">
              <div className="flex-shrink-0">
                <UserIcon className="h-10 w-10 text-blue-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs font-medium text-blue-200 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
            <div className="mt-5 flex-1 flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {user?.role === 'super_admin' && (
                  <>
                    <Link
                      to="/dashboard/groups"
                      className="flex items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-blue-700 group"
                    >
                      <UserGroupIcon className="mr-3 h-5 w-5 text-blue-300" />
                      All Groups
                    </Link>
                    <Link
                      to="/dashboard/users"
                      className="flex items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-blue-700 group"
                    >
                      <UserIcon className="mr-3 h-5 w-5 text-blue-300" />
                      User Management
                    </Link>
                  </>
                )}
                <Link
                  to="/dashboard/my-group"
                  className="flex items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-blue-700 group"
                >
                  <UserGroupIcon className="mr-3 h-5 w-5 text-blue-300" />
                  My Group
                </Link>
                <Link
                  to="/dashboard/contributions"
                  className="flex items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-blue-700 group"
                >
                  <CashIcon className="mr-3 h-5 w-5 text-blue-300" />
                  Contributions
                </Link>
                <Link
                  to="/dashboard/loans"
                  className="flex items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-blue-700 group"
                >
                  <DocumentTextIcon className="mr-3 h-5 w-5 text-blue-300" />
                  Loans
                </Link>
                <Link
                  to="/dashboard/reports"
                  className="flex items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-blue-700 group"
                >
                  <ChartBarIcon className="mr-3 h-5 w-5 text-blue-300" />
                  Reports
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="flex items-center px-2 py-2 text-sm font-medium text-white rounded-md hover:bg-blue-700 group"
                >
                  <CogIcon className="mr-3 h-5 w-5 text-blue-300" />
                  Settings
                </Link>
              </nav>
            </div>
          </div>
          <div className="flex-shrink-0 flex p-4">
            <button
              onClick={handleLogout}
              className="flex-shrink-0 w-full group block"
            >
              <div className="flex items-center">
                <LogoutIcon className="mr-3 h-5 w-5 text-blue-300" />
                <span className="text-sm font-medium text-white">Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;