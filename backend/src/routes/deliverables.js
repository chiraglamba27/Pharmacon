import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  listDeliverables, listAllDeliverables, getDeliverable,
  createDeliverable, updateDeliverable,
  publishDeliverable, deleteDeliverable,
} from '../controllers/deliverables.controller.js';

const router = Router();
router.get('/', listDeliverables);
router.get('/admin', requireAuth, requireRole('admin'), listAllDeliverables);
router.get('/:id', getDeliverable);
router.post('/', requireAuth, requireRole('admin'), createDeliverable);
router.put('/:id', requireAuth, requireRole('admin'), updateDeliverable);
router.patch('/:id/publish', requireAuth, requireRole('admin'), publishDeliverable);
router.delete('/:id', requireAuth, requireRole('admin'), deleteDeliverable);
export default router;
