import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

  if (!group || !balances) return <div>Loading...</div>;

  const filteredExpenses = selectedUser 
    ? expenses.filter(exp => 
        exp.paidById === selectedUser || 
        exp.splits.some((s: any) => s.userId === selectedUser)
      )
    : [];

  return (
    <div className="group-detail-page">
      <header className="page-header">
        <Link to="/" className="btn-text">← Back to Dashboard</Link>
        <h1>{group.name}</h1>
      </header>

      <div className="group-content grid">
        <div className="balances-section">
          <h2>Balances</h2>
          <div className="card">
            {balances.individualSummaries.map((summary: any) => (
              <div 
                key={summary.userId} 
                className={`balance-item ${summary.status} ${selectedUser === summary.userId ? 'selected' : ''}`}
                onClick={() => setSelectedUser(summary.userId === selectedUser ? null : summary.userId)}
                style={{ cursor: 'pointer', padding: '10px', borderRadius: '4px', marginBottom: '5px' }}
              >
                <div className="balance-info">
                  <span className="user-name">{summary.name}</span>
                  <span className={`balance-amount ${summary.status}`}>
                    {summary.status === 'owed' ? '+' : ''}₹{Math.abs(summary.netBalance).toLocaleString()}
                  </span>
                </div>
                <div className="balance-status">
                  {summary.status === 'owed' ? 'is owed' : summary.status === 'owes' ? 'owes' : 'settled'}
                </div>
                {selectedUser === summary.userId && (
                   <div className="click-hint" style={{ fontSize: '0.7rem', color: '#666' }}>
                     Click to hide breakdown
                   </div>
                )}
              </div>
            ))}
          </div>

          <h2>How to Settle</h2>
          <div className="card">
            {balances.simplifiedDebts.length === 0 ? (
              <p>Everything is settled!</p>
            ) : (
              balances.simplifiedDebts.map((debt: any, idx: number) => (
                <div key={idx} className="debt-item">
                  <strong>{debt.fromName}</strong> pays <strong>{debt.toName}</strong>: ₹{debt.amount.toLocaleString()}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="breakdown-section">
          <h2>{selectedUser ? `Breakdown for ${balances.individualSummaries.find((s: any) => s.userId === selectedUser).name}` : 'Select a person to see breakdown'}</h2>
          {selectedUser ? (
            <div className="expenses-list">
              {filteredExpenses.length === 0 ? (
                <p>No expenses involving this person.</p>
              ) : (
                filteredExpenses.map(exp => {
                  const userSplit = exp.splits.find((s: any) => s.userId === selectedUser);
                  const isPayer = exp.paidById === selectedUser;
                  const amountAffected = isPayer ? (exp.amount - (userSplit?.owedAmount || 0)) : -(userSplit?.owedAmount || 0);

                  return (
                    <div key={exp.id} className="card expense-card">
                      <div className="expense-header">
                        <span className="expense-date">{format(new Date(exp.date), 'MMM dd, yyyy')}</span>
                        <span className={`expense-impact ${amountAffected >= 0 ? 'positive' : 'negative'}`}>
                          {amountAffected >= 0 ? '+' : '-'}₹{Math.abs(amountAffected).toLocaleString()}
                        </span>
                      </div>
                      <div className="expense-desc">{exp.description}</div>
                      <div className="expense-meta">
                        {isPayer ? 'You paid' : `${exp.paidBy.name} paid`} ₹{exp.amount.toLocaleString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="card empty-state">
              <p>Rohan: "If the app says I owe ₹2,300, I want to see exactly which expenses make that up."</p>
              <p>Click on any name on the left to see their detailed expense breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
