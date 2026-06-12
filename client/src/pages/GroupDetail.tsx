import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ExpenseChat from '../components/ExpenseChat';

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: { name: string };
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
      const gResp = await fetch(`http://localhost:5000/api/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (gResp.ok) {
        const groups = await gResp.json();
        const currentGroup = groups.find((g: any) => g.id === id);
        setGroup(currentGroup);
      }

      const eResp = await fetch(`http://localhost:5000/api/expenses/group/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (eResp.ok) setExpenses(await eResp.json());

      const bResp = await fetch(`http://localhost:5000/api/settlements/group/${id}/balances`, {
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
      const response = await fetch(`http://localhost:5000/api/groups/${id}/members`, {
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
      const response = await fetch(`http://localhost:5000/api/expenses`, {
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
      const response = await fetch(`http://localhost:5000/api/settlements`, {
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
    <div className="container">
      <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
        <h1>{group.name}</h1>
        <button onClick={() => setShowExpenseForm(!showExpenseForm)}>
          {showExpenseForm ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      <div className="flex" style={{ gap: '20px' }}>
        <div style={{ flex: 2 }}>
          {showExpenseForm && (
            <div className="card">
              <h3>New Expense</h3>
              <form onSubmit={handleCreateExpense}>
                <input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} required />
                <input type="number" placeholder="Total Amount" value={amount} onChange={e => setAmount(e.target.value)} required />
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Split Type:</label>
                  <select value={splitType} onChange={e => setSplitType(e.target.value)} style={{ width: '100%', padding: '10px' }}>
                    <option value="EQUAL">Equally</option>
                    <option value="EXACT">Exact Amounts</option>
                    <option value="PERCENT">Percentages</option>
                    <option value="SHARE">Shares</option>
                  </select>
                </div>

                {splitType !== 'EQUAL' && (
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>Enter {splitType === 'EXACT' ? 'amounts' : splitType === 'PERCENT' ? 'percentages' : 'shares'} for each member:</p>
                    {group.members.map((m: any) => (
                      <div key={m.user.id} className="flex items-center justify-between" style={{ marginBottom: '5px' }}>
                        <span>{m.user.name}</span>
                        <input 
                          type="number" 
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

                <button type="submit" style={{ width: '100%' }}>Save Expense</button>
              </form>
            </div>
          )}

          <h3>Expenses</h3>
          {expenses.map(exp => (
            <div key={exp.id}>
              <div 
                className={`card flex justify-between cursor-pointer ${selectedExpenseId === exp.id ? 'border-primary' : ''}`}
                onClick={() => setSelectedExpenseId(selectedExpenseId === exp.id ? null : exp.id)}
                style={{ cursor: 'pointer', border: selectedExpenseId === exp.id ? '2px solid #1cc29f' : '1px solid #ddd' }}
              >
                <div>
                  <strong>{exp.description}</strong>
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                    Paid by {exp.paidBy.name} on {new Date(exp.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  ${exp.amount.toFixed(2)}
                </div>
              </div>
              {selectedExpenseId === exp.id && (
                <div style={{ marginBottom: '20px' }}>
                  <ExpenseChat expenseId={exp.id} />
                </div>
              )}
            </div>
          ))}
          {expenses.length === 0 && <p>No expenses yet.</p>}
        </div>

        <div style={{ flex: 1 }}>
          <div className="card">
            <h3>Balances</h3>
            {group.members.map((m: any) => {
              const balance = balances[m.user.id] || 0;
              return (
                <div key={m.user.id} className="flex justify-between" style={{ marginBottom: '10px' }}>
                  <span>{m.user.name} {m.user.id === user?.id && '(You)'}</span>
                  <span style={{ color: balance > 0 ? 'green' : balance < 0 ? 'red' : 'gray', fontWeight: 'bold' }}>
                    {balance > 0 ? `+${balance.toFixed(2)}` : balance.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="card">
            <h3>Settle Debt</h3>
            <form onSubmit={handleSettle}>
              <select 
                value={settleToId} 
                onChange={e => setSettleToId(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              >
                <option value="">Settle with...</option>
                {group.members.filter((m: any) => m.user.id !== user?.id).map((m: any) => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
              <input 
                type="number" 
                placeholder="Amount" 
                value={settleAmount} 
                onChange={e => setSettleAmount(e.target.value)} 
                required 
              />
              <button type="submit" style={{ width: '100%' }}>Record Payment</button>
            </form>
          </div>

          <div className="card">
            <h3>Add Member</h3>
            <form onSubmit={handleAddMember}>
              <input 
                type="email" 
                placeholder="User Email" 
                value={newMemberEmail} 
                onChange={e => setNewMemberEmail(e.target.value)} 
                required 
              />
              <button type="submit" style={{ width: '100%' }}>Add</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
