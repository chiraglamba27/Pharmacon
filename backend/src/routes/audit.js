import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listAuditLogs, getAuditLog } from '../controllers/audit.controller.js';

const router = Router();
router.get('/', requireAuth, requireRole('admin'), listAuditLogs);
router.get('/:id', requireAuth, requireRole('admin'), getAuditLog);
export default router;
