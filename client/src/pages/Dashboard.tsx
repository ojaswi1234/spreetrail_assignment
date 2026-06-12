import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Plus } from 'lucide-react';

interface Group {
  id: string;
  name: string;
}

const Dashboard = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchGroups();
  }, [token]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('https://spreetrail-assignment-backend.onrender.com/api/groups', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (err) {
      console.error('Error fetching groups');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('https://spreetrail-assignment-backend.onrender.com/api/groups', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newGroupName }),
      });
      if (response.ok) {
        setNewGroupName('');
        setShowForm(false);
        fetchGroups();
      }
    } catch (err) {
      console.error('Error creating group');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', color: '#111' }}>Dashboard</h1>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="amount-label">Total Balance</div>
          <div className="amount-value" style={{ fontSize: '24px', marginTop: '8px' }}>$0.00</div>
        </div>
        <div className="summary-card">
          <div className="amount-label">You Owe</div>
          <div className="amount-value text-negative" style={{ fontSize: '24px', marginTop: '8px' }}>$0.00</div>
        </div>
        <div className="summary-card">
          <div className="amount-label">You Are Owed</div>
          <div className="amount-value text-positive" style={{ fontSize: '24px', marginTop: '8px' }}>$0.00</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Your Groups</h3>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> {showForm ? 'Cancel' : 'New Group'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreateGroup} style={{ marginBottom: '24px', padding: '16px', background: '#f9fafa', borderRadius: '8px', border: '1px solid #eaeaea' }}>
            <div className="form-group">
              <label>Group Name</label>
              <input 
                type="text" 
                placeholder="e.g. Miami Trip, Apartment" 
                value={newGroupName} 
                onChange={(e) => setNewGroupName(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn-primary">Create Group</button>
          </form>
        )}

        <div>
          {groups.map((group) => (
            <Link key={group.id} to={`/group/${group.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="expense-item">
                <div className="expense-icon" style={{ borderRadius: '8px', background: 'rgba(28, 194, 159, 0.1)', color: 'var(--primary)' }}><Users size={20} /></div>
                <div className="expense-info">
                  <div className="expense-name">{group.name}</div>
                  <div className="expense-meta">Click to view details</div>
                </div>
                <div className="expense-amounts">
                  <div className="amount-box">
                    <span className="amount-label">Status</span>
                    <span className="amount-value" style={{ color: '#9ca3af' }}>Settled</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {groups.length === 0 && !showForm && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <Users size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
              <p>You haven't added any groups yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
