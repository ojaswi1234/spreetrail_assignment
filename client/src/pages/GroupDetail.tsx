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
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-4 gap-4">
        <div className="space-y-2">
          <Link to="/" className="brutal-btn brutal-btn-outline py-1 px-3 shadow-[2px_2px_0px_#000] text-[10px]">
            <ArrowLeft size={12} strokeWidth={3} /> BACK TO DASHBOARD
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-2 border-2 border-black">
              <Activity size={24} strokeWidth={3} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-[0.8]">
              {group.name}
            </h1>
          </div>
        </div>
        <button className="brutal-btn brutal-btn-primary bg-brutal-blue! text-lg py-3 px-6">
          <CreditCard size={20} strokeWidth={3} /> SETTLE DEBT
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Balances */}
        <div className="lg:col-span-4 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4 bg-black text-white p-3 brutal-card shadow-none">
              <PieChart size={18} strokeWidth={3} />
              <h2 className="text-lg font-black uppercase italic">Balances</h2>
            </div>
            <div className="space-y-2">
              {balances.individualSummaries.map((summary: any) => (
                <motion.div 
                  key={summary.userId} 
                  whileHover={{ x: 2 }}
                  onClick={() => setSelectedUser(summary.userId === selectedUser ? null : summary.userId)}
                  className={`brutal-card cursor-pointer p-3 flex justify-between items-center ${
                    selectedUser === summary.userId ? 'bg-black text-white ring-2 ring-offset-2 ring-black' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 border-2 border-black ${summary.status === 'owed' ? 'bg-brutal-green' : summary.status === 'owes' ? 'bg-brutal-pink' : 'bg-slate-200'}`}>
                      <UserIcon size={16} strokeWidth={3} className={selectedUser === summary.userId ? 'text-black' : ''} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm leading-none mb-0.5">{summary.name}</h4>
                      <span className={`text-[8px] font-black uppercase px-1 ${
                        selectedUser === summary.userId ? 'bg-white text-black' : 'bg-black text-white'
                      }`}>
                        {summary.status === 'owed' ? 'CREDITOR' : summary.status === 'owes' ? 'DEBTOR' : 'NEUTRAL'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-black tabular-nums ${
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
            <div className="flex items-center gap-2 mb-4 bg-brutal-yellow p-3 border-2 border-black shadow-[2px_2px_0px_#000]">
              <TrendingUp size={18} strokeWidth={3} />
              <h2 className="text-lg font-black uppercase italic">Resolution</h2>
            </div>
            <div className="brutal-card bg-white p-4 space-y-2">
              {balances.simplifiedDebts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="font-black text-sm uppercase text-emerald-500 italic">All settled.</p>
                </div>
              ) : (
                balances.simplifiedDebts.map((debt: any, idx: number) => (
                  <div key={idx} className="p-2 border-b-2 border-black last:border-b-0 space-y-1">
                    <div className="flex justify-between text-[8px] font-black uppercase">
                      <span className="bg-brutal-pink px-1">FROM: {debt.fromName}</span>
                      <span className="bg-brutal-green px-1">TO: {debt.toName}</span>
                    </div>
                    <div className="text-2xl font-black tracking-tighter">
                      ₹{debt.amount.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Info size={24} strokeWidth={4} />
            <h2 className="text-2xl font-black uppercase italic">
              {selectedUser ? `Breakdown: ${balances.individualSummaries.find((s: any) => s.userId === selectedUser).name}` : 'Expense Log'}
            </h2>
          </div>
          
          <AnimatePresence mode="wait">
            {selectedUser ? (
              <motion.div 
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {filteredExpenses.length === 0 ? (
                  <div className="brutal-card bg-slate-100 py-12 text-center italic">
                    <p className="font-black text-sm text-slate-400">NO TRANSACTIONS FOUND.</p>
                  </div>
                ) : (
                  filteredExpenses.map(exp => {
                    const userSplit = exp.splits.find((s: any) => s.userId === selectedUser);
                    const isPayer = exp.paidById === selectedUser;
                    const amountAffected = isPayer ? (exp.amount - (userSplit?.owedAmount || 0)) : -(userSplit?.owedAmount || 0);

                    return (
                      <div key={exp.id} className={`brutal-card p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
                        amountAffected >= 0 ? 'border-l-[10px] border-l-brutal-green' : 'border-l-[10px] border-l-brutal-pink'
                      }`}>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[8px] uppercase bg-black text-white px-1.5 py-0.5">
                              {format(new Date(exp.date), 'yyyy.MM.dd')}
                            </span>
                            <span className="font-bold text-[8px] text-slate-500 uppercase tracking-widest">
                              ID: {exp.id.slice(0,6)}
                            </span>
                          </div>
                          <h3 className="text-lg font-black uppercase tracking-tight">{exp.description}</h3>
                          <div className="text-[10px] font-bold text-slate-600 uppercase">
                            {isPayer ? <span className="text-black font-black">YOU PAID</span> : <span>SOURCE: {exp.paidBy.name}</span>} // TOTAL: ₹{exp.amount.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right w-full md:w-auto border-t md:border-t-0 md:border-l-2 border-black pt-2 md:pt-0 md:pl-4">
                          <div className={`text-2xl font-black tabular-nums ${amountAffected >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {amountAffected >= 0 ? '+' : '-'}₹{Math.abs(amountAffected).toLocaleString()}
                          </div>
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
                className="brutal-card bg-white p-8 text-center border-dashed space-y-4"
              >
                <div className="max-w-sm mx-auto space-y-4">
                  <div className="bg-brutal-blue inline-block p-4 rounded-full border-2 border-black shadow-[4px_4px_0px_#000]">
                    <Activity size={32} strokeWidth={3} />
                  </div>
                  <blockquote className="text-lg font-black italic uppercase leading-tight">
                    "No magic numbers. I want to see exactly which expenses make that up."
                  </blockquote>
                  <p className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.1em]">—— Rohan</p>
                  <div className="pt-4">
                    <p className="font-black bg-black text-white px-3 py-1.5 inline-block uppercase text-[10px]">Select a person to see their breakdown</p>
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
