import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../prisma';

export const recordSettlement = async (req: AuthRequest, res: Response) => {
  try {
    const { fromId, toId, amount, groupId } = req.body;

    const settlement = await prisma.settlement.create({
      data: {
        fromId,
        toId,
        amount,
        groupId,
      },
    });

    res.status(201).json(settlement);
  } catch (error) {
    res.status(500).json({ message: 'Error recording settlement' });
  }
};

export const getBalances = async (req: AuthRequest, res: Response) => {
  try {
    const groupId = req.params.groupId as string;

    // Get all expenses and their splits in the group
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        splits: true,
      },
    });

    // Get all settlements in the group
    const settlements = await prisma.settlement.findMany({
      where: { groupId },
    });

    const balances: Record<string, number> = {};

    // Calculate based on expenses
    expenses.forEach((expense: any) => {
      // The person who paid gets a positive balance for the amount others owe them
      // Everyone who owes gets a negative balance
      expense.splits.forEach((split: any) => {
        if (split.userId !== expense.paidById) {
          // split.userId owes expense.paidById
          balances[split.userId] = (balances[split.userId] || 0) - split.amount;
          balances[expense.paidById] = (balances[expense.paidById] || 0) + split.amount;
        }
      });
    });

    // Adjust based on settlements
    settlements.forEach((settlement: any) => {
      // fromId paid toId, so fromId's debt decreases (balance increases)
      // toId received money, so their credit decreases (balance decreases)
      balances[settlement.fromId] = (balances[settlement.fromId] || 0) + settlement.amount;
      balances[settlement.toId] = (balances[settlement.toId] || 0) - settlement.amount;
    });

    res.status(200).json(balances);
  } catch (error) {
    res.status(500).json({ message: 'Error calculating balances' });
  }
};
