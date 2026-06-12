import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../prisma';

export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.userId!;

    const group = await prisma.group.create({
      data: {
        name,
        createdBy: userId,
        members: {
          create: { userId },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error creating group' });
  }
};

export const getGroups = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const groups = await prisma.group.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups' });
  }
};

export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    const groupId = req.params.groupId as string;
    const { email } = req.body;

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingMember = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: userToAdd.id, groupId } },
    });

    if (existingMember) {
      return res.status(400).json({ message: 'User already in group' });
    }

    await prisma.groupMember.create({
      data: { userId: userToAdd.id, groupId },
    });

    res.status(200).json({ message: 'Member added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding member' });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const groupId = req.params.groupId as string;
    const userId = req.params.userId as string;

    await prisma.groupMember.delete({
      where: { userId_groupId: { userId, groupId } },
    });

    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing member' });
  }
};
