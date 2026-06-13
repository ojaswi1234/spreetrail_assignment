import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Upload, Users, PlusCircle, LayoutGrid, Terminal } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/groups').then(res => setGroups(res.data));
  }, []);

  const cardColors = ['bg-brutal-yellow', 'bg-brutal-blue', 'bg-brutal-pink', 'bg-brutal-green', 'bg-brutal-orange'];

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-8 border-black pb-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Terminal size={40} strokeWidth={3} className="bg-black text-white p-2" />
            <span className="font-black text-2xl uppercase tracking-widest bg-black text-white px-3">Status: Online</span>
          </div>
          <h1 className="text-7xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8]">
            DASHBOARD
          </h1>
          <p className="mt-4 font-black text-2xl uppercase italic text-slate-600">
            Welcome, Operator {user?.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => navigate('/import')} className="brutal-btn brutal-btn-primary text-xl">
            <Upload size={24} strokeWidth={3} /> IMPORT DATA
          </button>
          <button onClick={logout} className="brutal-btn brutal-btn-outline text-xl">
            <LogOut size={24} strokeWidth={3} /> TERMINATE SESSION
          </button>
        </div>
      </header>

      <section>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
             <LayoutGrid size={40} strokeWidth={3} />
             <h2 className="text-4xl font-black uppercase italic">Active Clusters</h2>
          </div>
          <button className="brutal-btn bg-brutal-green! text-xl w-full md:w-auto">
            <PlusCircle size={24} strokeWidth={3} /> INITIALIZE CLUSTER
          </button>
        </div>
        
        {groups.length === 0 ? (
          <div className="brutal-card bg-white py-24 text-center border-dashed">
            <Users size={80} strokeWidth={3} className="mx-auto mb-6 text-slate-300" />
            <p className="text-3xl font-black uppercase text-slate-400">No active data clusters detected.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groups.map((group, idx) => (
              <motion.div
                key={group.id}
                whileHover={{ scale: 1.02, rotate: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link 
                  to={`/groups/${group.id}`} 
                  className={`brutal-card block p-8 h-full ${cardColors[idx % cardColors.length]}!`}
                >
                  <div className="flex justify-between items-start mb-12">
                    <div className="bg-black text-white p-4 border-3 border-black shadow-[4px_4px_0px_white]">
                      <Users size={32} strokeWidth={3} />
                    </div>
                    <span className="font-black text-sm uppercase bg-white px-3 py-1 border-2 border-black">
                      UID: {group.id.slice(0, 8)}
                    </span>
                  </div>
                  <h3 className="text-4xl font-black uppercase italic leading-none mb-6">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="brutal-badge bg-white text-lg px-4">
                      {group.members.length} UNITS CONNECTED
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <footer className="pt-24 opacity-30">
        <p className="font-black text-xs uppercase tracking-[0.5em] text-center">
          NEO-BRUTALIST PROTOCOL V5.0 // END OF TRANSMISSION
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
