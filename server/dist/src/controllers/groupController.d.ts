import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
export declare const createGroup: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getGroups: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addMember: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const removeMember: (req: AuthRequest, res: Response) => Promise<void>;
