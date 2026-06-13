import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12 }}
        className="w-full max-w-lg brutal-card bg-brutal-yellow p-8 md:p-12"
      >
        <div className="mb-10 text-left">
          <h1 className="text-6xl md:text-7xl font-black mb-2 tracking-tighter leading-none italic uppercase">
            LOG IN
          </h1>
          <p className="font-black text-xl md:text-2xl uppercase border-b-4 border-black pb-2 inline-block">
            System: Shared Expenses
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-black uppercase text-sm">
              <Mail size={16} strokeWidth={3} /> Email Terminal
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="user@network.net" 
              className="brutal-input"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-black uppercase text-sm">
              <Key size={16} strokeWidth={3} /> Encryption Key
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              className="brutal-input"
              required 
            />
          </div>

          {error && (
            <motion.div 
              initial={{ x: -10 }}
              animate={{ x: 0 }}
              className="bg-black text-white p-4 font-black uppercase text-center border-3 border-black shadow-[4px_4px_0px_#f472b6]"
            >
              Error: {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            className="brutal-btn brutal-btn-primary w-full bg-black! text-white! text-2xl py-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <LogIn size={28} strokeWidth={3} /> ACCESS GRANTED
          </button>
        </form>

        <div className="mt-12 brutal-card bg-white p-6 shadow-none rotate-1 hover:rotate-0 transition-transform">
          <h4 className="font-black uppercase text-sm mb-4 border-b-2 border-black inline-block">Authorized Demo Credentials:</h4>
          <ul className="space-y-2 font-bold text-sm">
            <li className="flex justify-between">
              <span>ADMIN:</span> 
              <code className="bg-brutal-pink px-2">aisha@example.com</code>
            </li>
            <li className="flex justify-between">
              <span>KEY:</span> 
              <code className="bg-brutal-blue px-2">password123</code>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
