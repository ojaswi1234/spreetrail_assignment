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
    <nav>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Splitwise
        </Link>
        {user ? (
          <div className="nav-auth-buttons">
            <Link to="/dashboard" style={{ color: 'white', fontWeight: '500', fontSize: '14px' }}>Dashboard</Link>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>{user.name}</span>
            <button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: '1px solid white', padding: '5px 12px', borderRadius: '4px', color: 'white', fontSize: '12px' }}>
              Log out
            </button>
          </div>
        ) : (
          <div className="nav-auth-buttons">
            <Link to="/login" className="nav-login">Log in</Link>
            <Link to="/register">
              <button className="nav-signup">Sign up</button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
