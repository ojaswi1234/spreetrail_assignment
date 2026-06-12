import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const recordSettlement: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getBalances: (req: AuthRequest, res: Response) => Promise<void>;
