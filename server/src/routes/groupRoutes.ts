import express from 'express';
import { createGroup, getGroups, addMember, removeMember } from '../controllers/groupController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createGroup);
router.get('/', getGroups);
router.post('/:groupId/members', addMember);
router.delete('/:groupId/members/:userId', removeMember);

export default router;
