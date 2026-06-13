import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, PieChart, TrendingUp, Info } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';

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

  if (!group || !balances) return <div className="app-container">Loading...</div>;

  const filteredExpenses = selectedUser 
    ? expenses.filter(exp => 
        exp.paidById === selectedUser || 
        exp.splits.some((s: any) => s.userId === selectedUser)
      )
    : [];

  return (
    <div className="group-detail-page app-container">
      <header className="page-header">
        <div>
          <Link to="/" className="btn-text" style={{ marginBottom: '1rem' }}>
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
          <h1>{group.name}</h1>
        </div>
        <div className="header-actions">
           <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <CreditCard size={18} /> Record Payment
           </button>
        </div>
      </header>

      <div className="group-content grid" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
        <div className="balances-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <PieChart size={24} style={{ color: '#4f46e5' }} />
            <h2 style={{ margin: 0 }}>Balances</h2>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            {balances.individualSummaries.map((summary: any) => (
              <div 
                key={summary.userId} 
                className={`balance-item ${summary.status} ${selectedUser === summary.userId ? 'selected' : ''}`}
                onClick={() => setSelectedUser(summary.userId === selectedUser ? null : summary.userId)}
                style={{ cursor: 'pointer' }}
              >
                <div className="user-info">
                  <span className="user-name">{summary.name}</span>
                  <span className="balance-status">
                    {summary.status === 'owed' ? 'is owed' : summary.status === 'owes' ? 'owes' : 'settled'}
                  </span>
                </div>
                <div className="balance-amount">
                  {summary.status === 'owed' ? '+' : ''}₹{Math.abs(summary.netBalance).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '2rem 0 1.5rem' }}>
            <TrendingUp size={24} style={{ color: '#4f46e5' }} />
            <h2 style={{ margin: 0 }}>How to Settle</h2>
          </div>
          <div className="card">
            {balances.simplifiedDebts.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>
                <p>Everything is settled! 🎉</p>
              </div>
            ) : (
              balances.simplifiedDebts.map((debt: any, idx: number) => (
                <div key={idx} className="debt-item">
                  <strong>{debt.fromName}</strong> pays <strong>{debt.toName}</strong><br/>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5' }}>₹{debt.amount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="breakdown-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Info size={24} style={{ color: '#4f46e5' }} />
            <h2 style={{ margin: 0 }}>
              {selectedUser ? `Breakdown for ${balances.individualSummaries.find((s: any) => s.userId === selectedUser).name}` : 'Details'}
            </h2>
          </div>
          {selectedUser ? (
            <div className="expenses-list" style={{ animation: 'fadeIn 0.3s ease-out' }}>
              {filteredExpenses.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: '#64748b' }}>
                  <p>No expenses involving this person.</p>
                </div>
              ) : (
                filteredExpenses.map(exp => {
                  const userSplit = exp.splits.find((s: any) => s.userId === selectedUser);
                  const isPayer = exp.paidById === selectedUser;
                  const amountAffected = isPayer ? (exp.amount - (userSplit?.owedAmount || 0)) : -(userSplit?.owedAmount || 0);

                  return (
                    <div key={exp.id} className="card expense-card" style={{ borderLeft: `6px solid ${amountAffected >= 0 ? '#10b981' : '#f43f5e'}` }}>
                      <div className="expense-header">
                        <span className="expense-date">{format(new Date(exp.date), 'MMM dd, yyyy')}</span>
                        <span className={`expense-impact ${amountAffected >= 0 ? 'positive' : 'negative'}`}>
                          {amountAffected >= 0 ? '+' : '-'}₹{Math.abs(amountAffected).toLocaleString()}
                        </span>
                      </div>
                      <div className="expense-desc">{exp.description}</div>
                      <div className="expense-meta">
                        {isPayer ? <span style={{ color: '#4f46e5', fontWeight: 600 }}>You paid</span> : <span>{exp.paidBy.name} paid</span>} ₹{exp.amount.toLocaleString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', borderStyle: 'dashed', background: 'transparent' }}>
              <PieChart size={48} style={{ color: '#cbd5e1', marginBottom: '1.5rem' }} />
              <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500, maxWidth: '400px', margin: '0 auto' }}>
                "No magic numbers. If the app says I owe ₹2,300, I want to see exactly which expenses make that up." — Rohan
              </p>
              <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Click on a person on the left to see their breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
