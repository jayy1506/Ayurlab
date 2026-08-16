import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  
  if (currentUser === undefined) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary-color)' }}>
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;
