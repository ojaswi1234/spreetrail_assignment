"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalances = exports.recordSettlement = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const recordSettlement = async (req, res) => {
    try {
        const { fromId, toId, amount, groupId } = req.body;
        const settlement = await prisma_1.default.settlement.create({
            data: {
                fromId,
                toId,
                amount,
                groupId,
            },
        });
        res.status(201).json(settlement);
    }
    catch (error) {
        res.status(500).json({ message: 'Error recording settlement' });
    }
};
exports.recordSettlement = recordSettlement;
const getBalances = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        // Get all expenses and their splits in the group
        const expenses = await prisma_1.default.expense.findMany({
            where: { groupId },
            include: {
                splits: true,
            },
        });
        // Get all settlements in the group
        const settlements = await prisma_1.default.settlement.findMany({
            where: { groupId },
        });
        const balances = {};
        // Calculate based on expenses
        expenses.forEach((expense) => {
            // The person who paid gets a positive balance for the amount others owe them
            // Everyone who owes gets a negative balance
            expense.splits.forEach((split) => {
                if (split.userId !== expense.paidById) {
                    // split.userId owes expense.paidById
                    balances[split.userId] = (balances[split.userId] || 0) - split.amount;
                    balances[expense.paidById] = (balances[expense.paidById] || 0) + split.amount;
                }
            });
        });
        // Adjust based on settlements
        settlements.forEach((settlement) => {
            // fromId paid toId, so fromId's debt decreases (balance increases)
            // toId received money, so their credit decreases (balance decreases)
            balances[settlement.fromId] = (balances[settlement.fromId] || 0) + settlement.amount;
            balances[settlement.toId] = (balances[settlement.toId] || 0) - settlement.amount;
        });
        res.status(200).json(balances);
    }
    catch (error) {
        res.status(500).json({ message: 'Error calculating balances' });
    }
};
exports.getBalances = getBalances;
//# sourceMappingURL=settlementController.js.map