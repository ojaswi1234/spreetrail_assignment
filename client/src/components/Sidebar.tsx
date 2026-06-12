import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Users } from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="sidebar">
      <div>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', color: '#666', textDecoration: 'none', marginBottom: '15px', fontSize: '14px', fontWeight: '500' }}>
          <Home size={18} style={{ marginRight: '10px' }} /> Dashboard
        </Link>
        <div style={{ color: '#999', fontSize: '12px', textTransform: 'uppercase', paddingLeft: '10px', marginBottom: '10px', marginTop: '20px', fontWeight: 'bold' }}>Groups</div>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', color: '#666', textDecoration: 'none', marginBottom: '10px', fontSize: '14px' }}>
          <Users size={18} style={{ marginRight: '10px' }} /> View All Groups
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
