import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users } from 'lucide-react';

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
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add a group'}
        </button>
      </div>

      <div className="summary-bar">
        <div className="summary-item">
          <div className="amount-label">total balance</div>
          <div className="amount-value">$0.00</div>
        </div>
        <div className="summary-item">
          <div className="amount-label">you owe</div>
          <div className="amount-value text-negative">$0.00</div>
        </div>
        <div className="summary-item">
          <div className="amount-label">you are owed</div>
          <div className="amount-value text-positive">$0.00</div>
        </div>
      </div>

      <div className="content-padded">
        {showForm && (
          <div className="card" style={{ padding: '20px', borderBottom: '2px solid #5bc5a7', marginBottom: '20px' }}>
            <h3>Start a new group</h3>
            <form onSubmit={handleCreateGroup}>
              <input 
                type="text" 
                placeholder="Enter group name" 
                value={newGroupName} 
                onChange={(e) => setNewGroupName(e.target.value)} 
                required 
              />
              <button type="submit" className="btn-primary">Save</button>
            </form>
          </div>
        )}

        <div>
          <h3 style={{ color: '#999', fontSize: '14px', textTransform: 'uppercase', marginBottom: '10px' }}>Your Groups</h3>
          {groups.map((group) => (
            <Link key={group.id} to={`/group/${group.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="expense-item" style={{ border: '1px solid #eee', marginBottom: '-1px' }}>
                <div className="expense-icon"><Users size={20} /></div>
                <div className="expense-info">
                  <div className="expense-name">{group.name}</div>
                </div>
                <div className="expense-amounts">
                  <div className="amount-box">
                    <span className="amount-label">settled</span>
                    <span className="amount-value" style={{ color: '#ccc' }}>$0.00</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {groups.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999', border: '1px solid #eee' }}>
              <p>You have not added any groups yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
