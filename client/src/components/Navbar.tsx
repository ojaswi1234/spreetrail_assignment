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
          Split<span>wise</span>
        </Link>
        {user ? (
          <div className="nav-auth-buttons">
            <Link to="/dashboard" style={{ color: '#555', fontWeight: '600', fontSize: '14px' }}>Dashboard</Link>
            <span style={{ color: '#111', fontSize: '14px', fontWeight: '600' }}>{user.name}</span>
            <button onClick={handleLogout} style={{ backgroundColor: '#f4f5f7', border: '1px solid #eaeaea', padding: '6px 14px', borderRadius: '6px', color: '#555', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
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
