import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';

const PrivateRoute = ({ children }) => {
  const { authenticated } = useAuth();
  return authenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
