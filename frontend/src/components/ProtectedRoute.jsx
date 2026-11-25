import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext';
import Spinner from './Spinner';

// Frontend gate for UX only — the API enforces the same rules independently.
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fill />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}
