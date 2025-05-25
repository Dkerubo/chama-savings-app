import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
