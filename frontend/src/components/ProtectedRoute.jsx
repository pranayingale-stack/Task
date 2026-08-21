import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, user, initializing } = useAuth();

  if (initializing) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    const fallback = user.role === 'tech_head' ? '/tech-head' : '/member';
    return <Navigate to={fallback} replace />;
  }
  return children;
}
