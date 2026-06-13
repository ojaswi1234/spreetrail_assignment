import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
        className="w-full max-w-md brutal-card bg-brutal-yellow p-6 md:p-8"
      >
        <div className="mb-6 text-left">
          <h1 className="text-4xl md:text-5xl font-black mb-1 tracking-tighter leading-none italic uppercase">
            LOG IN
          </h1>
          <p className="font-black text-sm uppercase border-b-2 border-black pb-1 inline-block">
            Shared Expenses App
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="flex items-center gap-2 font-black uppercase text-[10px]">
              <Mail size={12} strokeWidth={3} /> Email
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="user@example.com" 
              className="brutal-input text-sm"
              required 
            />
          </div>
          
          <div className="space-y-1">
            <label className="flex items-center gap-2 font-black uppercase text-[10px]">
              <Key size={12} strokeWidth={3} /> Password
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              className="brutal-input text-sm"
              required 
            />
          </div>

          {error && (
            <motion.div 
              initial={{ x: -10 }}
              animate={{ x: 0 }}
              className="bg-black text-white p-2 text-xs font-black uppercase text-center border-2 border-black shadow-[2px_2px_0px_#f472b6]"
            >
              Error: {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            className="brutal-btn brutal-btn-primary w-full bg-black! text-white! text-lg py-3 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            <LogIn size={20} strokeWidth={3} /> SIGN IN
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="font-black uppercase text-[10px]">
            New Entity? <Link to="/register" className="underline hover:text-white transition-colors">Create account</Link>
          </p>
        </div>

        <div className="mt-6 brutal-card bg-white p-4 shadow-none rotate-1 hover:rotate-0 transition-transform">
          <h4 className="font-black uppercase text-[10px] mb-2 border-b border-black inline-block">Authorized Demo Credentials:</h4>
          <ul className="space-y-1 font-bold text-[10px]">
            <li className="flex justify-between">
              <span>ADMIN:</span> 
              <code className="bg-brutal-pink px-1">aisha@example.com</code>
            </li>
            <li className="flex justify-between">
              <span>KEY:</span> 
              <code className="bg-brutal-blue px-1">password123</code>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
