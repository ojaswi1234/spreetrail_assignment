import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.sendStatus(401);

    const group = await prisma.group.create({
      data: {
        name,
        members: {
          create: {
            userId: userId,
          },
        },
      },
      include: {
        members: true,
      },
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error creating group', error });
  }
};

export const getGroups = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.sendStatus(401);

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups', error });
  }
};

export const getGroupById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!group) return res.status(404).json({ message: 'Group not found' });

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group', error });
  }
};

export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { userId, joinedAt, leftAt } = req.body;

    const membership = await prisma.groupMember.create({
      data: {
        groupId: id,
        userId,
        joinedAt: joinedAt ? new Date(joinedAt) : undefined,
        leftAt: leftAt ? new Date(leftAt) : undefined,
      },
    });

    res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ message: 'Error adding member', error });
  }
};
