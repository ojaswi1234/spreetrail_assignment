import express from 'express';
import { recordSettlement, getBalances } from '../controllers/settlementController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/', recordSettlement);
router.get('/group/:groupId/balances', getBalances);

export default router;
