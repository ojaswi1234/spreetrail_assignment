import { Router } from 'express';
import multer from 'multer';
import { analyzeImport, executeImport, getImportReport } from '../controllers/importController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateJWT as any);

router.post('/analyze', upload.single('file'), analyzeImport as any);
router.post('/execute', executeImport as any);
router.get('/report/:id', getImportReport as any);

export default router;
