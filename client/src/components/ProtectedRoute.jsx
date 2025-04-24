import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role: requiredRole }) {
  const { auth } = useAuth();
  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && auth.role !== requiredRole) {
    // unauthorized
    return <Navigate to={`/${auth.role}`} replace />;
  }
  return children;
}
