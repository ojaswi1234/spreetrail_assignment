"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMember = exports.getGroupById = exports.getGroups = exports.createGroup = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user?.id;
        if (!userId)
            return res.sendStatus(401);
        const group = await prisma_1.default.group.create({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating group', error });
    }
};
exports.createGroup = createGroup;
const getGroups = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.sendStatus(401);
        const groups = await prisma_1.default.group.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching groups', error });
    }
};
exports.getGroups = getGroups;
const getGroupById = async (req, res) => {
    try {
        const id = req.params.id;
        const group = await prisma_1.default.group.findUnique({
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
        if (!group)
            return res.status(404).json({ message: 'Group not found' });
        res.json(group);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching group', error });
    }
};
exports.getGroupById = getGroupById;
const addMember = async (req, res) => {
    try {
        const id = req.params.id;
        const { userId, joinedAt, leftAt } = req.body;
        const membership = await prisma_1.default.groupMember.create({
            data: {
                groupId: id,
                userId,
                joinedAt: joinedAt ? new Date(joinedAt) : undefined,
                leftAt: leftAt ? new Date(leftAt) : undefined,
            },
        });
        res.status(201).json(membership);
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding member', error });
    }
};
exports.addMember = addMember;
