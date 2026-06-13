"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettlementsByGroup = exports.createSettlement = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createSettlement = async (req, res) => {
    try {
        const { groupId, paidById, paidToId, amount, date } = req.body;
        const settlement = await prisma_1.default.settlement.create({
            data: {
                groupId,
                paidById,
                paidToId,
                amount,
                date: new Date(date),
            },
        });
        res.status(201).json(settlement);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating settlement', error });
    }
};
exports.createSettlement = createSettlement;
const getSettlementsByGroup = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const settlements = await prisma_1.default.settlement.findMany({
            where: { groupId },
            include: {
                paidBy: { select: { id: true, name: true } },
                paidTo: { select: { id: true, name: true } },
            },
            orderBy: { date: 'desc' },
        });
        res.json(settlements);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching settlements', error });
    }
};
exports.getSettlementsByGroup = getSettlementsByGroup;
