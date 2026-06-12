import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const createExpense: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getGroupExpenses: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getExpenseChat: (req: AuthRequest, res: Response) => Promise<void>;
export declare const postChatMessage: (req: AuthRequest, res: Response) => Promise<void>;
