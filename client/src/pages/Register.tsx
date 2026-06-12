import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('https://spreetrail-assignment-backend.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user, data.token);
        navigate('/');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: '24px', color: '#999', marginBottom: '20px' }}>INTRODUCE YOURSELF</h2>
      {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Hi there! My name is</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Here's my email address:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>And here's my password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>Sign me up!</button>
      </form>
      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
        Already have an account? <Link to="/login" style={{ color: '#5bc5a7' }}>Log in</Link>
      </p>
    </div>
  );
};

export default Register;
