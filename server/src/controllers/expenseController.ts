import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../prisma';

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { description, amount, groupId, splitType, splits } = req.body;
    const paidById = req.userId!;

    // splits: Array<{ userId: string, amount?: number, percentage?: number, shares?: number }>

    const expense = await prisma.expense.create({
      data: {
        description,
        amount,
        groupId,
        paidById,
        splits: {
          create: splits.map((s: any) => ({
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
  } catch (error) {
    res.status(500).json({ message: 'Error creating expense' });
  }
};

export const getGroupExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const groupId = req.params.groupId as string;

    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        paidBy: { select: { id: true, name: true } },
        splits: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses' });
  }
};

export const getExpenseChat = async (req: AuthRequest, res: Response) => {
  try {
    const expenseId = req.params.expenseId as string;

    const messages = await prisma.chatMessage.findMany({
      where: { expenseId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat' });
  }
};

export const postChatMessage = async (req: AuthRequest, res: Response) => {
  try {
    const expenseId = req.params.expenseId as string;
    const { message } = req.body;
    const userId = req.userId!;

    const chatMessage = await prisma.chatMessage.create({
      data: {
        expenseId,
        userId,
        message,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    res.status(201).json(chatMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error posting message' });
  }
};
