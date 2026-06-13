import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Upload, Users, PlusCircle, LayoutGrid, Terminal } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = () => {
    api.get('/groups').then(res => setGroups(res.data));
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    setCreateLoading(true);
    try {
      await api.post('/groups', { name: newGroupName });
      setNewGroupName('');
      setIsCreating(false);
      fetchGroups();
    } catch (err) {
      console.error('Error creating group', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const cardColors = ['bg-brutal-yellow', 'bg-brutal-blue', 'bg-brutal-pink', 'bg-brutal-green', 'bg-brutal-orange'];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-4 border-black pb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Terminal size={24} strokeWidth={3} className="bg-black text-white p-1" />
            <span className="font-black text-xs uppercase tracking-widest bg-black text-white px-2">Status: Online</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-[0.8]">
            DASHBOARD
          </h1>
          <p className="mt-2 font-black text-sm uppercase italic text-slate-600">
            Welcome, {user?.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/import')} className="brutal-btn brutal-btn-primary">
            <Upload size={16} strokeWidth={3} /> IMPORT CSV
          </button>
          <button onClick={logout} className="brutal-btn brutal-btn-outline">
            <LogOut size={16} strokeWidth={3} /> LOGOUT
          </button>
        </div>
      </header>

      <section>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
             <LayoutGrid size={24} strokeWidth={3} />
             <h2 className="text-2xl font-black uppercase italic">Your Groups</h2>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="brutal-btn bg-brutal-green! w-full md:w-auto"
          >
            <PlusCircle size={16} strokeWidth={3} /> CREATE GROUP
          </button>
        </div>

        <AnimatePresence>
          {isCreating && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <form onSubmit={handleCreateGroup} className="brutal-card bg-white p-4 flex flex-col md:flex-row gap-4 items-end shadow-none! border-dashed!">
                <div className="flex-1 w-full space-y-1">
                  <label className="text-[10px] font-black uppercase">Initialize New Group Name</label>
                  <input 
                    type="text" 
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    placeholder="e.g. Flat 402, Road Trip 2026" 
                    className="brutal-input text-sm"
                    autoFocus
                    required
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button type="submit" disabled={createLoading} className="brutal-btn bg-black! text-white! flex-1 md:flex-none justify-center">
                    {createLoading ? 'SYNCING...' : 'INITIALIZE'}
                  </button>
                  <button type="button" onClick={() => setIsCreating(false)} className="brutal-btn bg-white! text-black! flex-1 md:flex-none justify-center">
                    CANCEL
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        
        {groups.length === 0 ? (
          <div className="brutal-card bg-white py-12 text-center border-dashed">
            <Users size={48} strokeWidth={3} className="mx-auto mb-4 text-slate-300" />
            <p className="text-xl font-black uppercase text-slate-400">No groups found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, idx) => (
              <motion.div
                key={group.id}
                whileHover={{ scale: 1.02, rotate: -0.5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link 
                  to={`/groups/${group.id}`} 
                  className={`brutal-card block p-6 h-full ${cardColors[idx % cardColors.length]}!`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-black text-white p-2 border-2 border-black shadow-[2px_2px_0px_white]">
                      <Users size={20} strokeWidth={3} />
                    </div>
                    <span className="font-black text-[10px] uppercase bg-white px-2 py-0.5 border border-black">
                      ID: {group.id.slice(0, 8)}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black uppercase italic leading-none mb-4">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="brutal-badge bg-white text-xs px-2">
                      {group.members.length} MEMBERS
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <footer className="pt-12 opacity-30">
        <p className="font-black text-[10px] uppercase tracking-[0.3em] text-center">
          NEO-BRUTALIST PROTOCOL V5.0
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
