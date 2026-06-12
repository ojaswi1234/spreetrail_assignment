import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ backgroundColor: '#5bc5a7', padding: '10px 0', color: 'white' }}>
      <div className="container flex justify-between items-center">
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>
          Splitwise
        </Link>
        {user ? (
          <div className="flex items-center">
            <Link to="/dashboard" style={{ color: 'white', marginRight: '20px', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
            <span style={{ marginRight: '20px', color: 'rgba(255,255,255,0.8)' }}>{user.name}</span>
            <button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: '1px solid white', padding: '5px 15px' }}>
              Logout
            </button>
          </div>
        ) : (
          <div>
            <Link to="/login" style={{ color: 'white', marginRight: '20px', textDecoration: 'none', fontWeight: '500' }}>Log in</Link>
            <Link to="/register">
              <button style={{ backgroundColor: '#fff', color: '#5bc5a7', border: 'none', padding: '8px 20px' }}>
                Sign up
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
