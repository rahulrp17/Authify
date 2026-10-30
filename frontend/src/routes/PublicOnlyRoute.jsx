import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { FullPageLoader } from '../components/common/FullPageLoader';

export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageLoader label="Checking session" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
