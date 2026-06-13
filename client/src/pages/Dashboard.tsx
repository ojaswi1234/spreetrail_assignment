import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Upload, Users, PlusCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/groups').then(res => setGroups(res.data));
  }, []);

  return (
    <div className="dashboard-page app-container">
      <header className="page-header">
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Hi, {user?.name} 👋</h1>
          <p style={{ color: '#64748b', fontWeight: 500 }}>Here's what's happening with your expenses.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate('/import')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={18} /> Import CSV
          </button>
          <button className="btn-outline" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <div className="groups-list">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Your Groups</h2>
          <button className="btn-text">
            <PlusCircle size={20} /> New Group
          </button>
        </div>
        
        {groups.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Users size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No groups found. Please create or join a group.</p>
          </div>
        ) : (
          <div className="grid">
            {groups.map(group => (
              <Link to={`/groups/${group.id}`} key={group.id} className="card group-card">
                <div style={{ background: '#e0e7ff', padding: '1rem', borderRadius: '50%', marginBottom: '0.5rem' }}>
                  <Users size={32} style={{ color: '#4f46e5' }} />
                </div>
                <h3>{group.name}</h3>
                <span className="member-count">{group.members.length} Members</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
