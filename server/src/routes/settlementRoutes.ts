import { Router } from 'express';
import { createSettlement, getSettlementsByGroup } from '../controllers/settlementController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT as any);

router.post('/', createSettlement as any);
router.get('/group/:groupId', getSettlementsByGroup as any);

export default router;
