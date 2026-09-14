import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listUsers, getUser, updateUserRole, disableUser } from '../controllers/users.controller.js';

const router = Router();
router.get('/', requireAuth, requireRole('admin', 'clinic_staff', 'doctor', 'pharmacist'), listUsers);
router.get('/:id', requireAuth, getUser);
router.patch('/:id/role', requireAuth, requireRole('admin'), updateUserRole);
router.patch('/:id/disable', requireAuth, requireRole('admin'), disableUser);
export default router;
