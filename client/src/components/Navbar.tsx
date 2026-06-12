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
    <nav style={{ backgroundColor: '#1cc29f', padding: '10px 20px', color: 'white' }}>
      <div className="container flex justify-between items-center">
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>
          Splitwise Clone
        </Link>
        {user ? (
          <div className="flex items-center">
            <span style={{ marginRight: '20px' }}>Hi, {user.name}</span>
            <button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: '1px solid white' }}>
              Logout
            </button>
          </div>
        ) : (
          <div>
            <Link to="/login" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
