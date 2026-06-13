import { Router } from 'express';
import { createExpense, getExpensesByGroup, getGroupBalances } from '../controllers/expenseController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT as any);

router.post('/', createExpense as any);
router.get('/group/:groupId', getExpensesByGroup as any);
router.get('/group/:groupId/balances', getGroupBalances as any);

export default router;
