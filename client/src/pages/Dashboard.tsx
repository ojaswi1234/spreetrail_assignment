import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div className="dashboard-page">
      <header className="page-header">
        <h1>Welcome, {user?.name}</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate('/import')}>Import CSV</button>
          <button className="btn-outline" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="groups-list">
        <h2>Your Groups</h2>
        {groups.length === 0 ? (
          <p>No groups found. Please create or join a group.</p>
        ) : (
          <div className="grid">
            {groups.map(group => (
              <Link to={`/groups/${group.id}`} key={group.id} className="card group-card">
                <h3>{group.name}</h3>
                <p>{group.members.length} Members</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
