import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createRefillRequest, getMyRefills,
  listRefillRequests, approveRefill, rejectRefill,
} from '../controllers/refills.controller.js';

const router = Router();
router.post('/', requireAuth, requireRole('patient'), createRefillRequest);
router.get('/mine', requireAuth, requireRole('patient'), getMyRefills);
router.get('/', requireAuth, requireRole('admin', 'pharmacist'), listRefillRequests);
router.patch('/:id/approve', requireAuth, requireRole('admin', 'pharmacist'), approveRefill);
router.patch('/:id/reject', requireAuth, requireRole('admin', 'pharmacist'), rejectRefill);
export default router;
