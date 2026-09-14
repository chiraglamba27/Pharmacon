import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  listMedicines, getMedicine, createMedicine, updateMedicine, deactivateMedicine,
  restockMedicine, adjustStock,
  getTransactionHistory, getLowStockAlerts, getExpiringBatches,
} from '../controllers/inventory.controller.js';

const router = Router();
router.get('/medicines', requireAuth, listMedicines);
router.get('/medicines/:id', requireAuth, getMedicine);
router.post('/medicines', requireAuth, requireRole('admin', 'pharmacist'), createMedicine);
router.put('/medicines/:id', requireAuth, requireRole('admin', 'pharmacist'), updateMedicine);
router.patch('/medicines/:id/deactivate', requireAuth, requireRole('admin', 'pharmacist'), deactivateMedicine);
router.post('/medicines/:id/restock', requireAuth, requireRole('admin', 'pharmacist'), restockMedicine);
router.post('/medicines/:id/adjust', requireAuth, requireRole('admin', 'pharmacist'), adjustStock);
router.get('/medicines/:id/transactions', requireAuth, requireRole('admin', 'pharmacist'), getTransactionHistory);
router.get('/alerts/low-stock', requireAuth, requireRole('admin', 'pharmacist'), getLowStockAlerts);
router.get('/alerts/expiring', requireAuth, requireRole('admin', 'pharmacist'), getExpiringBatches);
export default router;
