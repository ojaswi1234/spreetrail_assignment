"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simplifyDebts = exports.calculateNetBalances = void 0;
const calculateNetBalances = (expenses, settlements, members) => {
    const balances = {};
    // Initialize all members with 0 balance
    members.forEach(m => {
        balances[m.userId] = 0;
    });
    // Add expenses
    expenses.forEach(exp => {
        // Payer is "owed" the full amount minus their own share
        const payerId = exp.paidById;
        if (balances[payerId] === undefined)
            balances[payerId] = 0;
        exp.splits.forEach((split) => {
            // Split user "owes" the owedAmount
            if (balances[split.userId] === undefined)
                balances[split.userId] = 0;
            balances[split.userId] -= split.owedAmount;
            if (split.userId === payerId) {
                // Technically payer also "owes" their share, but they paid the whole thing
            }
        });
        balances[payerId] += exp.amount;
    });
    // Add settlements
    settlements.forEach(settle => {
        if (balances[settle.paidById] === undefined)
            balances[settle.paidById] = 0;
        if (balances[settle.paidToId] === undefined)
            balances[settle.paidToId] = 0;
        balances[settle.paidById] += settle.amount;
        balances[settle.paidToId] -= settle.amount;
    });
    return balances;
};
exports.calculateNetBalances = calculateNetBalances;
const simplifyDebts = (balances) => {
    const sortedBalances = Object.entries(balances)
        .filter(([_, amount]) => Math.abs(amount) > 0.01)
        .sort(([, a], [, b]) => a - b);
    const creditors = [];
    const debtors = [];
    sortedBalances.forEach(([id, amount]) => {
        if (amount > 0) {
            creditors.push({ id, amount });
        }
        else {
            debtors.push({ id, amount: Math.abs(amount) });
        }
    });
    const transactions = [];
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
        if (debtors[i].amount < 0.01)
            i++;
        if (creditors[j].amount < 0.01)
            j++;
    }
    return transactions;
};
exports.simplifyDebts = simplifyDebts;
