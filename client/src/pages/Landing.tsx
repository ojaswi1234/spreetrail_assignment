import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Smartphone, Zap } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();

  // If user is logged in, redirect them to their dashboard
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="container">
      <section className="landing-hero">
        <div className="hero-text">
          <h1>Less stress when sharing expenses with anyone.</h1>
          <p>
            Keep track of your shared expenses and balances with housemates, trips, groups, friends, and family.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/register">
              <button className="btn-primary" style={{ padding: '15px 40px', fontSize: '18px' }}>
                Sign up
              </button>
            </Link>
          </div>
          <p style={{ marginTop: '20px', fontSize: '14px', color: '#999' }}>
            Free for iPhone, Android and web.
          </p>
        </div>
        <div className="hero-visual">
          <div className="hero-image-placeholder">
            $
          </div>
        </div>
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <div style={{ color: 'var(--primary)' }}><Zap size={40} /></div>
          <h3>Track balances</h3>
          <p>Keep track of shared expenses, balances, and who owes who.</p>
        </div>
        <div className="feature-card">
          <div style={{ color: 'var(--primary)' }}><Smartphone size={40} /></div>
          <h3>Organize groups</h3>
          <p>Split expenses with any group: trips, housemates, friends, and family.</p>
        </div>
        <div className="feature-card">
          <div style={{ color: 'var(--primary)' }}><Shield size={40} /></div>
          <h3>Settle up</h3>
          <p>Pay your friends back with ease and record any payment type.</p>
        </div>
      </section>

      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <h2>Ready to start splitting?</h2>
        <Link to="/register">
          <button className="btn-primary" style={{ padding: '12px 30px', marginTop: '20px' }}>
            Create an account
          </button>
        </Link>
      </div>

      <footer className="landing-footer">
        <div className="container">
          <p>© 2026 Splitwise Clone MVP - Internship Assignment</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
