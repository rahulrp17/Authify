import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { FullPageLoader } from '../components/common/FullPageLoader';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};
