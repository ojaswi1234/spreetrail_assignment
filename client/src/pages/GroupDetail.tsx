import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ExpenseChat from '../components/ExpenseChat';
import { Tag, ChevronDown, MessageSquare } from 'lucide-react';

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
      <div className="dashboard-header">
        <h1>{group.name}</h1>
        <button className="btn-primary" onClick={() => setShowExpenseForm(!showExpenseForm)}>
          {showExpenseForm ? 'Cancel' : 'Add an expense'}
        </button>
      </div>

      <div className="content-padded" style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: 2 }}>
          {showExpenseForm && (
            <div className="card" style={{ padding: '20px', borderBottom: '2px solid #5bc5a7' }}>
              <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Add an expense</h3>
              <form onSubmit={handleCreateExpense}>
                <div className="form-group">
                  <label>With you and: all of {group.name}</label>
                  <input placeholder="Enter a description" value={desc} onChange={e => setDesc(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '24px', marginRight: '10px' }}>$</span>
                    <input type="number" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required style={{ fontSize: '24px', width: '200px' }} />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Paid by you and split:</label>
                  <select value={splitType} onChange={e => setSplitType(e.target.value)}>
                    <option value="EQUAL">equally</option>
                    <option value="EXACT">exact amounts</option>
                    <option value="PERCENT">percentages</option>
                    <option value="SHARE">shares</option>
                  </select>
                </div>

                {splitType !== 'EQUAL' && (
                  <div className="card" style={{ marginBottom: '15px', background: '#f9f9f9' }}>
                    <p style={{ fontSize: '13px', color: '#666' }}>Enter {splitType === 'EXACT' ? 'amounts' : splitType === 'PERCENT' ? 'percentages' : 'shares'} for each member:</p>
                    {group.members.map((m: any) => (
                      <div key={m.user.id} className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                        <span>{m.user.name}</span>
                        <input 
                          type="number" 
                          step="0.01"
                          placeholder={splitType} 
                          style={{ width: '100px', marginBottom: 0 }}
                          value={memberSplits[m.user.id] || ''}
                          onChange={e => setMemberSplits({...memberSplits, [m.user.id]: e.target.value})}
                          required
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Save</button>
              </form>
            </div>
          )}

          <div style={{ marginTop: '10px' }}>
            {expenses.map(exp => (
              <div key={exp.id}>
                <div 
                  className="expense-item"
                  onClick={() => setSelectedExpenseId(selectedExpenseId === exp.id ? null : exp.id)}
                >
                  <div className="expense-date">
                    {new Date(exp.createdAt).toLocaleString('en-us', { month: 'short' })}<br />
                    <span style={{ fontSize: '16px', color: '#333' }}>{new Date(exp.createdAt).getDate()}</span>
                  </div>
                  <div className="expense-icon"><Tag size={20} /></div>
                  <div className="expense-info">
                    <div className="expense-name">{exp.description}</div>
                    <div className="expense-meta">
                      {exp.paidBy.id === user?.id ? 'you' : exp.paidBy.name} paid <span style={{ fontWeight: '500' }}>${exp.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="expense-amounts">
                    <div className="amount-box">
                      <span className="amount-label">{exp.paidBy.id === user?.id ? 'you lent' : 'you borrowed'}</span>
                      <span className={`amount-value ${exp.paidBy.id === user?.id ? 'text-positive' : 'text-negative'}`}>
                        ${(exp.amount / group.members.length).toFixed(2)}
                      </span>
                    </div>
                    <div style={{ alignSelf: 'center', color: '#ccc' }}><ChevronDown size={16} /></div>
                  </div>
                </div>
                {selectedExpenseId === exp.id && (
                  <div className="card" style={{ padding: '20px', backgroundColor: '#f9f9f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', fontSize: '14px', color: '#666' }}>
                      <MessageSquare size={16} style={{ marginRight: '8px' }} />
                      <strong>Notes and comments</strong>
                    </div>
                    <ExpenseChat expenseId={exp.id} />
                  </div>
                )}
              </div>
            ))}
            {expenses.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#ccc' }}>
                <p>No expenses added yet in this group.</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div className="card" style={{ border: 'none', background: 'transparent', padding: '0' }}>
            <h3 style={{ color: '#999', fontSize: '12px', textTransform: 'uppercase', marginBottom: '15px' }}>Group Balances</h3>
            {group.members.map((m: any) => {
              const balance = balances[m.user.id] || 0;
              return (
                <div key={m.user.id} className="flex justify-between" style={{ marginBottom: '12px', fontSize: '14px' }}>
                  <span style={{ color: '#333' }}>{m.user.name} {m.user.id === user?.id && '(You)'}</span>
                  <span style={{ color: balance > 0 ? '#5bc5a7' : balance < 0 ? '#ff652f' : '#999', fontWeight: 'bold' }}>
                    {balance > 0 ? `owes $${balance.toFixed(2)}` : balance < 0 ? `is owed $${Math.abs(balance).toFixed(2)}` : 'is settled up'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ marginTop: '30px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
            <h3>Settle up</h3>
            <form onSubmit={handleSettle}>
              <select 
                value={settleToId} 
                onChange={e => setSettleToId(e.target.value)} 
                required 
                style={{ background: 'white' }}
              >
                <option value="">Choose a member</option>
                {group.members.filter((m: any) => m.user.id !== user?.id).map((m: any) => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
              <input 
                type="number" 
                step="0.01"
                placeholder="Amount" 
                value={settleAmount} 
                onChange={e => setSettleAmount(e.target.value)} 
                required 
                style={{ background: 'white' }}
              />
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Record Payment</button>
            </form>
          </div>

          <div className="card" style={{ marginTop: '30px', border: '1px dashed #ccc', background: 'transparent' }}>
            <h3 style={{ fontSize: '14px' }}>Invite members</h3>
            <form onSubmit={handleAddMember}>
              <input 
                type="email" 
                placeholder="Email address" 
                value={newMemberEmail} 
                onChange={e => setNewMemberEmail(e.target.value)} 
                required 
              />
              <button type="submit" className="btn-primary" style={{ width: '100%', background: '#eee', color: '#333' }}>Send invite</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
