import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface SidebarProps {
  role: 'admin' | 'member';
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();
  const [active, setActive] = useState('');

  useEffect(() => {
    setActive(location.pathname);
  }, [location.pathname]);

  const commonLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Profile', path: '/profile' },
    { label: 'Groups', path: '/groups' },
    { label: 'Members', path: '/members' },
    { label: 'Contributions', path: '/contributions' },
    { label: 'Loans', path: '/loans' },
    { label: 'Investments', path: '/investments' },
    { label: 'Transactions', path: '/transactions' },
    { label: 'Meetings', path: '/meetings' },
    { label: 'Goals', path: '/goals' },
    { label: 'Messages', path: '/messages' },
    { label: 'Notifications', path: '/notifications' },
  ];

  const adminLinks = [
    { label: 'All Users', path: '/admin/users' },
    { label: 'All Groups', path: '/admin/groups' },
    { label: 'Admin Settings', path: '/admin/settings' },
  ];

  return (
    <div className="h-screen w-64 bg-emerald-900 text-white flex flex-col py-4 px-3">
      <h2 className="text-2xl font-bold mb-6 text-center">My Dashboard</h2>
      <nav className="flex-1 space-y-2">
        {commonLinks.map(({ label, path }) => (
          <Link
            key={path}
            to={path}
            className={`block px-4 py-2 rounded hover:bg-emerald-700 ${
              active === path ? 'bg-emerald-700' : ''
            }`}
          >
            {label}
          </Link>
        ))}

        {role === 'admin' &&
          adminLinks.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={`block px-4 py-2 rounded hover:bg-emerald-700 ${
                active === path ? 'bg-emerald-700' : ''
              }`}
            >
              {label}
            </Link>
          ))}
      </nav>
    </div>
  );
};

export default Sidebar;
