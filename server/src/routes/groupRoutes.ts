import { Router } from 'express';
import { createGroup, getGroups, getGroupById, addMember } from '../controllers/groupController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT as any);

router.post('/', createGroup as any);
router.get('/', getGroups as any);
router.get('/:id', getGroupById as any);
router.post('/:id/members', addMember as any);

export default router;
