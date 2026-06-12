import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ExpenseChat from '../components/ExpenseChat';
import { Tag, ChevronDown, MessageSquare, Plus, DollarSign, UserPlus } from 'lucide-react';

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: { id: string, name: string };
  createdAt: string;
}

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  
  // New Expense State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState('EQUAL');
  const [memberSplits, setMemberSplits] = useState<Record<string, string>>({});

  // Settlement State
  const [settleToId, setSettleToId] = useState('');
  const [settleAmount, setSettleAmount] = useState('');

  useEffect(() => {
    fetchGroupData();
  }, [id, token]);

  const fetchGroupData = async () => {
    try {
      const gResp = await fetch(`https://spreetrail-assignment-backend.onrender.com/api/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (gResp.ok) {
        const groups = await gResp.json();
        const currentGroup = groups.find((g: any) => g.id === id);
        setGroup(currentGroup);
      }

      const eResp = await fetch(`https://spreetrail-assignment-backend.onrender.com/api/expenses/group/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (eResp.ok) setExpenses(await eResp.json());

      const bResp = await fetch(`https://spreetrail-assignment-backend.onrender.com/api/settlements/group/${id}/balances`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (bResp.ok) setBalances(await bResp.json());
    } catch (err) {
      console.error('Error fetching group data');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://spreetrail-assignment-backend.onrender.com/api/groups/${id}/members`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ email: newMemberEmail }),
      });
      if (response.ok) {
        setNewMemberEmail('');
        fetchGroupData();
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (err) {
      console.error('Error adding member');
    }
  };

  const handleRemoveMember = async (userIdToRemove: string) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      const response = await fetch(`https://spreetrail-assignment-backend.onrender.com/api/groups/${id}/members/${userIdToRemove}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
      if (response.ok) {
        fetchGroupData();
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (err) {
      console.error('Error removing member');
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = parseFloat(amount);
    let splits: any[] = [];

    if (splitType === 'EQUAL') {
      splits = group.members.map((m: any) => ({
        userId: m.user.id,
        amount: totalAmount / group.members.length
      }));
    } else if (splitType === 'EXACT') {
      splits = group.members.map((m: any) => ({
        userId: m.user.id,
        amount: parseFloat(memberSplits[m.user.id] || '0')
      }));
    } else if (splitType === 'PERCENT') {
      splits = group.members.map((m: any) => ({
        userId: m.user.id,
        amount: (parseFloat(memberSplits[m.user.id] || '0') / 100) * totalAmount
      }));
    } else if (splitType === 'SHARE') {
      const totalShares = group.members.reduce((acc: number, m: any) => acc + parseFloat(memberSplits[m.user.id] || '0'), 0);
      splits = group.members.map((m: any) => ({
        userId: m.user.id,
        amount: (parseFloat(memberSplits[m.user.id] || '0') / totalShares) * totalAmount
      }));
    }

    try {
      const response = await fetch(`https://spreetrail-assignment-backend.onrender.com/api/expenses`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          description: desc, 
          amount: totalAmount, 
          groupId: id, 
          splitType,
          splits 
        }),
      });
      if (response.ok) {
        setDesc('');
        setAmount('');
        setMemberSplits({});
        setShowExpenseForm(false);
        fetchGroupData();
      }
    } catch (err) {
      console.error('Error creating expense');
    }
  };

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://spreetrail-assignment-backend.onrender.com/api/settlements`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          fromId: user!.id,
          toId: settleToId,
          amount: parseFloat(settleAmount),
          groupId: id
        }),
      });
      if (response.ok) {
        setSettleToId('');
        setSettleAmount('');
        fetchGroupData();
      }
    } catch (err) {
      console.error('Error recording settlement');
    }
  };

  if (!group) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', color: '#111' }}>{group.name}</h1>
        <button className="btn-primary" onClick={() => setShowExpenseForm(!showExpenseForm)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> {showExpenseForm ? 'Cancel' : 'Add an expense'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        {/* Left Column: Expenses */}
        <div style={{ flex: 2 }}>
          {showExpenseForm && (
            <div className="card">
              <div className="card-header">
                <h3>Add a new expense</h3>
              </div>
              <form onSubmit={handleCreateExpense}>
                <div className="form-group">
                  <label>Description</label>
                  <input placeholder="e.g. Dinner, Uber, Groceries" value={desc} onChange={e => setDesc(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
                </div>
                
                <div className="form-group">
                  <label>Split Type</label>
                  <select value={splitType} onChange={e => setSplitType(e.target.value)}>
                    <option value="EQUAL">Split equally</option>
                    <option value="EXACT">Exact amounts</option>
                    <option value="PERCENT">Percentages</option>
                    <option value="SHARE">By shares</option>
                  </select>
                </div>

                {splitType !== 'EQUAL' && (
                  <div style={{ marginBottom: '20px', padding: '16px', background: '#f9fafa', borderRadius: '8px', border: '1px solid #eaeaea' }}>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>Enter {splitType === 'EXACT' ? 'amounts' : splitType === 'PERCENT' ? 'percentages' : 'shares'} for each member:</p>
                    {group.members.map((m: any) => (
                      <div key={m.user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{m.user.name}</span>
                        <input 
                          type="number" 
                          step="0.01"
                          placeholder={splitType} 
                          style={{ width: '120px', marginBottom: 0 }}
                          value={memberSplits[m.user.id] || ''}
                          onChange={e => setMemberSplits({...memberSplits, [m.user.id]: e.target.value})}
                          required
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>Save Expense</button>
              </form>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h3>Expenses</h3>
            </div>
            {expenses.map(exp => (
              <div key={exp.id}>
                <div 
                  className="expense-item"
                  onClick={() => setSelectedExpenseId(selectedExpenseId === exp.id ? null : exp.id)}
                  style={{ cursor: 'pointer', border: selectedExpenseId === exp.id ? '1px solid var(--primary)' : '1px solid #eaeaea' }}
                >
                  <div className="expense-date">
                    {new Date(exp.createdAt).toLocaleString('en-us', { month: 'short' })}<br />
                    <span style={{ fontSize: '16px', color: '#333' }}>{new Date(exp.createdAt).getDate()}</span>
                  </div>
                  <div className="expense-icon" style={{ borderRadius: '8px', background: 'rgba(28, 194, 159, 0.1)', color: 'var(--primary)' }}><Tag size={20} /></div>
                  <div className="expense-info">
                    <div className="expense-name">{exp.description}</div>
                    <div className="expense-meta">
                      {exp.paidBy.id === user?.id ? 'You' : exp.paidBy.name} paid <span style={{ fontWeight: '600' }}>${exp.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="expense-amounts">
                    <div className="amount-box">
                      <span className="amount-label">{exp.paidBy.id === user?.id ? 'You lent' : 'You borrowed'}</span>
                      <span className={`amount-value ${exp.paidBy.id === user?.id ? 'text-positive' : 'text-negative'}`}>
                        ${(exp.amount / group.members.length).toFixed(2)}
                      </span>
                    </div>
                    <div style={{ alignSelf: 'center', color: '#ccc' }}><ChevronDown size={16} /></div>
                  </div>
                </div>
                {selectedExpenseId === exp.id && (
                  <div style={{ padding: '20px', backgroundColor: '#f9fafa', borderRadius: '8px', border: '1px solid #eaeaea', marginBottom: '16px', marginTop: '-8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', fontSize: '14px', color: '#555', fontWeight: '600' }}>
                      <MessageSquare size={16} style={{ marginRight: '8px' }} />
                      Discussion & Notes
                    </div>
                    <ExpenseChat expenseId={exp.id} />
                  </div>
                )}
              </div>
            ))}
            {expenses.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                <Tag size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                <p>No expenses added yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar modules */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Balances Card */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <h3>Group Balances</h3>
            </div>
            {group.members.map((m: any) => {
              const balance = balances[m.user.id] || 0;
              return (
                <div key={m.user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '14px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
                  <span style={{ color: '#111', fontWeight: '500' }}>
                    {m.user.name} {m.user.id === user?.id && <span style={{ color: '#999', fontSize: '12px' }}>(You)</span>}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: balance > 0 ? 'var(--primary)' : balance < 0 ? 'var(--secondary)' : '#999', fontWeight: 'bold' }}>
                      {balance > 0 ? `owes $${balance.toFixed(2)}` : balance < 0 ? `gets back $${Math.abs(balance).toFixed(2)}` : 'settled up'}
                    </span>
                    {m.user.id !== user?.id && (
                      <button onClick={() => handleRemoveMember(m.user.id)} style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: '12px', cursor: 'pointer', padding: '0 4px' }} title="Remove user">
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Settle Up Card */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={18} /> Settle Up</h3>
            </div>
            <form onSubmit={handleSettle}>
              <div className="form-group">
                <label>Record a payment to</label>
                <select 
                  value={settleToId} 
                  onChange={e => setSettleToId(e.target.value)} 
                  required 
                >
                  <option value="">Choose a member</option>
                  {group.members.filter((m: any) => m.user.id !== user?.id).map((m: any) => (
                    <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  value={settleAmount} 
                  onChange={e => setSettleAmount(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Record Payment</button>
            </form>
          </div>

          {/* Invite Card */}
          <div className="card" style={{ marginBottom: 0, backgroundColor: '#f9fafa' }}>
            <div className="card-header" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: '10px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><UserPlus size={18} /> Invite Members</h3>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <input 
                  type="email" 
                  placeholder="Friend's email address" 
                  value={newMemberEmail} 
                  onChange={e => setNewMemberEmail(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" style={{ width: '100%', background: '#fff', border: '1px solid #d1d5db', color: '#111', padding: '8px 16px', borderRadius: '6px', fontWeight: '600' }}>Send Invite</button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
