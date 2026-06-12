import express from 'express';
import { createExpense, getGroupExpenses, getExpenseChat, postChatMessage } from '../controllers/expenseController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createExpense);
router.get('/group/:groupId', getGroupExpenses);
router.get('/:expenseId/chat', getExpenseChat);
router.post('/:expenseId/chat', postChatMessage);

export default router;
