"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupBalances = exports.getExpensesByGroup = exports.createExpense = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const balances_1 = require("../utils/balances");
const createExpense = async (req, res) => {
    try {
        const { groupId, paidById, amount, description, date, splitType, splits, // Array of { userId, shareValue }
        notes, originalAmount, originalCurrency, exchangeRate } = req.body;
        // Calculate owedAmount for each split
        let processedSplits = [];
        if (splitType === 'EQUAL') {
            const perPerson = amount / splits.length;
            processedSplits = splits.map((s) => ({
                userId: s.userId,
                owedAmount: parseFloat(perPerson.toFixed(2)),
                shareValue: null
            }));
        }
        else if (splitType === 'EXACT') {
            processedSplits = splits.map((s) => ({
                userId: s.userId,
                owedAmount: s.shareValue,
                shareValue: s.shareValue
            }));
        }
        else if (splitType === 'PERCENTAGE') {
            processedSplits = splits.map((s) => ({
                userId: s.userId,
                owedAmount: parseFloat(((s.shareValue / 100) * amount).toFixed(2)),
                shareValue: s.shareValue
            }));
        }
        else if (splitType === 'SHARE') {
            const totalShares = splits.reduce((acc, s) => acc + s.shareValue, 0);
            processedSplits = splits.map((s) => ({
                userId: s.userId,
                owedAmount: parseFloat(((s.shareValue / totalShares) * amount).toFixed(2)),
                shareValue: s.shareValue
            }));
        }
        const expense = await prisma_1.default.expense.create({
            data: {
                groupId,
                paidById,
                amount,
                description,
                date: new Date(date),
                splitType,
                notes,
                originalAmount,
                originalCurrency,
                exchangeRate,
                splits: {
                    create: processedSplits
                }
            },
            include: {
                splits: true
            }
        });
        res.status(201).json(expense);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating expense', error });
    }
};
exports.createExpense = createExpense;
const getExpensesByGroup = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const expenses = await prisma_1.default.expense.findMany({
            where: { groupId },
            include: {
                paidBy: { select: { id: true, name: true } },
                splits: { include: { user: { select: { id: true, name: true } } } }
            },
            orderBy: { date: 'desc' }
        });
        res.json(expenses);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error });
    }
};
exports.getExpensesByGroup = getExpensesByGroup;
const getGroupBalances = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const group = await prisma_1.default.group.findUnique({
            where: { id: groupId },
            include: { members: { include: { user: { select: { id: true, name: true } } } } }
        });
        if (!group)
            return res.status(404).json({ message: 'Group not found' });
        const expenses = await prisma_1.default.expense.findMany({
            where: { groupId },
            include: { splits: true }
        });
        const settlements = await prisma_1.default.settlement.findMany({
            where: { groupId }
        });
        const netBalances = (0, balances_1.calculateNetBalances)(expenses, settlements, group.members);
        const simplifiedDebts = (0, balances_1.simplifyDebts)(netBalances);
        // Map simplified debts with names
        const debtsWithNames = simplifiedDebts.map((debt) => ({
            ...debt,
            fromName: group.members.find((m) => m.userId === debt.from)?.user.name,
            toName: group.members.find((m) => m.userId === debt.to)?.user.name
        }));
        // Construct per-user summary
        const individualSummaries = group.members.map((member) => {
            const net = netBalances[member.userId] || 0;
            return {
                userId: member.userId,
                name: member.user.name,
                netBalance: parseFloat(net.toFixed(2)),
                status: net > 0 ? 'owed' : net < 0 ? 'owes' : 'settled'
            };
        });
        res.json({
            netBalances,
            simplifiedDebts: debtsWithNames,
            individualSummaries
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error calculating balances', error });
    }
};
exports.getGroupBalances = getGroupBalances;
