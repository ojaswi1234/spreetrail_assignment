interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export const calculateNetBalances = (expenses: any[], settlements: any[], members: any[]) => {
  const balances: Record<string, number> = {};

  // Initialize all members with 0 balance
  members.forEach(m => {
    balances[m.userId] = 0;
  });

  // Add expenses
  expenses.forEach(exp => {
    // Payer is "owed" the full amount minus their own share
    const payerId = exp.paidById;
    if (balances[payerId] === undefined) balances[payerId] = 0;
    
    exp.splits.forEach((split: any) => {
      // Split user "owes" the owedAmount
      if (balances[split.userId] === undefined) balances[split.userId] = 0;
      
      balances[split.userId] -= split.owedAmount;
      if (split.userId === payerId) {
        // Technically payer also "owes" their share, but they paid the whole thing
      }
    });
    
    balances[payerId] += exp.amount;
  });

  // Add settlements
  settlements.forEach(settle => {
    if (balances[settle.paidById] === undefined) balances[settle.paidById] = 0;
    if (balances[settle.paidToId] === undefined) balances[settle.paidToId] = 0;
    
    balances[settle.paidById] += settle.amount;
    balances[settle.paidToId] -= settle.amount;
  });

  return balances;
};

export const simplifyDebts = (balances: Record<string, number>): Transaction[] => {
  const sortedBalances = Object.entries(balances)
    .filter(([_, amount]) => Math.abs(amount) > 0.01)
    .sort(([, a], [, b]) => a - b);

  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  sortedBalances.forEach(([id, amount]) => {
    if (amount > 0) {
      creditors.push({ id, amount });
    } else {
      debtors.push({ id, amount: Math.abs(amount) });
    }
  });

  const transactions: Transaction[] = [];

  let i = 0; // debtors
  let j = 0; // creditors

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    transactions.push({
      from: debtors[i].id,
      to: creditors[j].id,
      amount: parseFloat(amount.toFixed(2))
    });

    debtors[i].amount -= amount;
    creditors[j].amount -= amount;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return transactions;
};
