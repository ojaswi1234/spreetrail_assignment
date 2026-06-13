import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const createSettlement = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId, paidById, paidToId, amount, date } = req.body;

    const settlement = await prisma.settlement.create({
      data: {
        groupId,
        paidById,
        paidToId,
        amount,
        date: new Date(date),
      },
    });

    res.status(201).json(settlement);
  } catch (error) {
    res.status(500).json({ message: 'Error creating settlement', error });
  }
};

export const getSettlementsByGroup = async (req: AuthRequest, res: Response) => {
  try {
    const groupId = req.params.groupId as string;
    const settlements = await prisma.settlement.findMany({
      where: { groupId },
      include: {
        paidBy: { select: { id: true, name: true } },
        paidTo: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });
    res.json(settlements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settlements', error });
  }
};
