import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, PieChart, TrendingUp, Info, Activity, User as UserIcon } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const GroupDetail = () => {
  const { id } = useParams();
  const [group, setGroup] = useState<any>(null);
  const [balances, setBalances] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const [groupRes, balanceRes, expenseRes] = await Promise.all([
      api.get(`/groups/${id}`),
      api.get(`/expenses/group/${id}/balances`),
      api.get(`/expenses/group/${id}`)
    ]);
    setGroup(groupRes.data);
    setBalances(balanceRes.data);
    setExpenses(expenseRes.data);
  };

  if (!group || !balances) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin bg-black w-12 h-12"></div>
    </div>
  );

  const filteredExpenses = selectedUser 
    ? expenses.filter(exp => 
        exp.paidById === selectedUser || 
        exp.splits.some((s: any) => s.userId === selectedUser)
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-8 border-black pb-8 gap-8">
        <div className="space-y-4">
          <Link to="/" className="brutal-btn brutal-btn-outline py-2 px-4 shadow-[4px_4px_0px_#000] text-sm">
            <ArrowLeft size={16} strokeWidth={3} /> RETURNING TO BASE
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-black text-white p-3 border-3 border-black">
              <Activity size={32} strokeWidth={3} />
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8]">
              {group.name}
            </h1>
          </div>
        </div>
        <button className="brutal-btn brutal-btn-primary bg-brutal-blue! text-xl py-5 px-10">
          <CreditCard size={28} strokeWidth={3} /> SETTLE DEBT
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Balances */}
        <div className="lg:col-span-4 space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-6 bg-black text-white p-4 brutal-card shadow-none">
              <PieChart size={24} strokeWidth={3} />
              <h2 className="text-2xl font-black uppercase italic">Ledger Summary</h2>
            </div>
            <div className="space-y-4">
              {balances.individualSummaries.map((summary: any) => (
                <motion.div 
                  key={summary.userId} 
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedUser(summary.userId === selectedUser ? null : summary.userId)}
                  className={`brutal-card cursor-pointer p-5 flex justify-between items-center ${
                    selectedUser === summary.userId ? 'bg-black text-white ring-4 ring-offset-4 ring-black' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 border-2 border-black ${summary.status === 'owed' ? 'bg-brutal-green' : summary.status === 'owes' ? 'bg-brutal-pink' : 'bg-slate-200'}`}>
                      <UserIcon size={20} strokeWidth={3} className={selectedUser === summary.userId ? 'text-black' : ''} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg leading-none mb-1">{summary.name}</h4>
                      <span className={`text-[10px] font-black uppercase px-1 ${
                        selectedUser === summary.userId ? 'bg-white text-black' : 'bg-black text-white'
                      }`}>
                        {summary.status === 'owed' ? 'CREDITOR' : summary.status === 'owes' ? 'DEBTOR' : 'NEUTRAL'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-black tabular-nums ${
                      selectedUser === summary.userId ? 'text-white' : 
                      summary.status === 'owed' ? 'text-emerald-600' : summary.status === 'owes' ? 'text-rose-600' : 'text-slate-400'
                    }`}>
                      {summary.status === 'owed' ? '+' : ''}₹{Math.abs(summary.netBalance).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6 bg-brutal-yellow p-4 border-3 border-black shadow-[4px_4px_0px_#000]">
              <TrendingUp size={24} strokeWidth={3} />
              <h2 className="text-2xl font-black uppercase italic">Resolution Plan</h2>
            </div>
            <div className="brutal-card bg-white p-6 space-y-4">
              {balances.simplifiedDebts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-black text-2xl uppercase text-emerald-500 italic">Financial equilibrium reached.</p>
                </div>
              ) : (
                balances.simplifiedDebts.map((debt: any, idx: number) => (
                  <div key={idx} className="p-4 border-b-4 border-black last:border-b-0 space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase">
                      <span className="bg-brutal-pink px-2">FROM: {debt.fromName}</span>
                      <span className="bg-brutal-green px-2">TO: {debt.toName}</span>
                    </div>
                    <div className="text-4xl font-black tracking-tighter">
                      ₹{debt.amount.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Breakdown */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <Info size={32} strokeWidth={4} />
            <h2 className="text-4xl font-black uppercase italic">
              {selectedUser ? `DATA STREAM: ${balances.individualSummaries.find((s: any) => s.userId === selectedUser).name}` : 'OPERATIONAL LOG'}
            </h2>
          </div>
          
          <AnimatePresence mode="wait">
            {selectedUser ? (
              <motion.div 
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {filteredExpenses.length === 0 ? (
                  <div className="brutal-card bg-slate-100 py-20 text-center italic">
                    <p className="font-black text-xl text-slate-400">NO CORRELATED TRANSACTIONS FOUND.</p>
                  </div>
                ) : (
                  filteredExpenses.map(exp => {
                    const userSplit = exp.splits.find((s: any) => s.userId === selectedUser);
                    const isPayer = exp.paidById === selectedUser;
                    const amountAffected = isPayer ? (exp.amount - (userSplit?.owedAmount || 0)) : -(userSplit?.owedAmount || 0);

                    return (
                      <div key={exp.id} className={`brutal-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                        amountAffected >= 0 ? 'border-l-[16px] border-l-brutal-green' : 'border-l-[16px] border-l-brutal-pink'
                      }`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-xs uppercase bg-black text-white px-2 py-0.5">
                              {format(new Date(exp.date), 'yyyy.MM.dd')}
                            </span>
                            <span className="font-bold text-xs text-slate-500 uppercase tracking-widest">
                              ID: {exp.id.slice(0,6)}
                            </span>
                          </div>
                          <h3 className="text-2xl font-black uppercase">{exp.description}</h3>
                          <div className="text-sm font-bold text-slate-600">
                            {isPayer ? <span className="text-black font-black uppercase">SYSTEM PAYER</span> : <span>SOURCE: {exp.paidBy.name}</span>} // TOTAL: ₹{exp.amount.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right w-full md:w-auto border-t-2 md:border-t-0 md:border-l-4 border-black pt-4 md:pt-0 md:pl-8">
                          <div className={`text-4xl font-black tabular-nums ${amountAffected >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {amountAffected >= 0 ? '+' : '-'}₹{Math.abs(amountAffected).toLocaleString()}
                          </div>
                          <span className="text-[10px] font-black uppercase">NET IMPACT ON CLUSTER</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="brutal-card bg-white p-12 text-center border-dashed space-y-8"
              >
                <div className="max-w-md mx-auto space-y-6">
                  <div className="bg-brutal-blue inline-block p-6 rounded-full border-4 border-black shadow-[8px_8px_0px_#000]">
                    <Activity size={48} strokeWidth={3} />
                  </div>
                  <blockquote className="text-2xl font-black italic uppercase leading-tight">
                    "No magic numbers. If the app says I owe ₹2,300, I want to see exactly which expenses make that up."
                  </blockquote>
                  <p className="font-bold text-slate-400 uppercase tracking-[0.2em]">—— Operator Rohan (Sector 402)</p>
                  <div className="pt-8 animate-bounce">
                    <p className="font-black bg-black text-white px-4 py-2 inline-block uppercase text-xs">Select user terminal to analyze data stream</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
