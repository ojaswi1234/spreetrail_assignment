"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postChatMessage = exports.getExpenseChat = exports.getGroupExpenses = exports.createExpense = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const prisma_1 = __importDefault(require("../prisma"));
const createExpense = async (req, res) => {
    try {
        const { description, amount, groupId, splitType, splits } = req.body;
        const paidById = req.userId;
        // splits: Array<{ userId: string, amount?: number, percentage?: number, shares?: number }>
        const expense = await prisma_1.default.expense.create({
            data: {
                description,
                amount,
                groupId,
                paidById,
                splits: {
                    create: splits.map((s) => ({
                        userId: s.userId,
                        amount: s.amount,
                        type: splitType,
                    })),
                },
            },
            include: {
                splits: true,
            },
        });
        res.status(201).json(expense);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating expense' });
    }
};
exports.createExpense = createExpense;
const getGroupExpenses = async (req, res) => {
    try {
        const { groupId } = req.params;
        const expenses = await prisma_1.default.expense.findMany({
            where: { groupId },
            include: {
                paidBy: { select: { id: true, name: true } },
                splits: { include: { user: { select: { id: true, name: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(expenses);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching expenses' });
    }
};
exports.getGroupExpenses = getGroupExpenses;
const getExpenseChat = async (req, res) => {
    try {
        const { expenseId } = req.params;
        const messages = await prisma_1.default.chatMessage.findMany({
            where: { expenseId },
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'asc' },
        });
        res.status(200).json(messages);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching chat' });
    }
};
exports.getExpenseChat = getExpenseChat;
const postChatMessage = async (req, res) => {
    try {
        const { expenseId } = req.params;
        const { message } = req.body;
        const userId = req.userId;
        const chatMessage = await prisma_1.default.chatMessage.create({
            data: {
                expenseId,
                userId,
                message,
            },
            include: { user: { select: { id: true, name: true } } },
        });
        res.status(201).json(chatMessage);
    }
    catch (error) {
        res.status(500).json({ message: 'Error posting message' });
    }
};
exports.postChatMessage = postChatMessage;
//# sourceMappingURL=expenseController.js.map