import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Group {
  id: string;
  name: string;
}

const Dashboard = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchGroups();
  }, [token]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/groups', {
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
      const response = await fetch('http://localhost:5000/api/groups', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newGroupName }),
      });
      if (response.ok) {
        setNewGroupName('');
        fetchGroups();
      }
    } catch (err) {
      console.error('Error creating group');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h3>Create New Group</h3>
        <form onSubmit={handleCreateGroup} className="flex">
          <input 
            type="text" 
            placeholder="Group Name" 
            value={newGroupName} 
            onChange={(e) => setNewGroupName(e.target.value)} 
            required 
            style={{ marginRight: '10px', marginBottom: '0' }}
          />
          <button type="submit">Create</button>
        </form>
      </div>

      <h2>Your Groups</h2>
      <div className="grid">
        {groups.map((group) => (
          <Link key={group.id} to={`/group/${group.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card hover-effect">
              <h4>{group.name}</h4>
            </div>
          </Link>
        ))}
        {groups.length === 0 && <p>You are not in any groups yet.</p>}
      </div>
    </div>
  );
};

export default Dashboard;
