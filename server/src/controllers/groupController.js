"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMember = exports.addMember = exports.getGroups = exports.createGroup = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const prisma_1 = __importDefault(require("../prisma"));
const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.userId;
        const group = await prisma_1.default.group.create({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating group' });
    }
};
exports.createGroup = createGroup;
const getGroups = async (req, res) => {
    try {
        const userId = req.userId;
        const groups = await prisma_1.default.group.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching groups' });
    }
};
exports.getGroups = getGroups;
const addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { email } = req.body;
        const userToAdd = await prisma_1.default.user.findUnique({ where: { email } });
        if (!userToAdd) {
            return res.status(404).json({ message: 'User not found' });
        }
        const existingMember = await prisma_1.default.groupMember.findUnique({
            where: { userId_groupId: { userId: userToAdd.id, groupId } },
        });
        if (existingMember) {
            return res.status(400).json({ message: 'User already in group' });
        }
        await prisma_1.default.groupMember.create({
            data: { userId: userToAdd.id, groupId },
        });
        res.status(200).json({ message: 'Member added successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding member' });
    }
};
exports.addMember = addMember;
const removeMember = async (req, res) => {
    try {
        const { groupId, userId } = req.params;
        await prisma_1.default.groupMember.delete({
            where: { userId_groupId: { userId, groupId } },
        });
        res.status(200).json({ message: 'Member removed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error removing member' });
    }
};
exports.removeMember = removeMember;
//# sourceMappingURL=groupController.js.map