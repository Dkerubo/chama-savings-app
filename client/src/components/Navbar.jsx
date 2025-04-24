import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { auth, logout } = useAuth();
  return (
    <nav className="bg-primary p-4 shadow-md">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-semibold">MyApp</Link>
        <div className="flex space-x-6">
          {auth.role === 'admin' && (
            <Link to="/admin" className="text-white">Admin Dashboard</Link>
          )}
          {auth.role === 'member' && (
            <Link to="/member" className="text-white">Member Dashboard</Link>
          )}
          <button
            onClick={logout}
            className="text-white bg-red-500 hover:bg-red-700 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
