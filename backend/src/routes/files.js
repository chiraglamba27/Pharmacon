import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import multer from 'multer';
import {
  uploadDeliverableFile, uploadPrescriptionFile,
  getSignedUrl, listFileAssets, deleteFileAsset,
} from '../controllers/files.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/upload/deliverable', requireAuth, requireRole('admin'), upload.single('file'), uploadDeliverableFile);
router.post('/upload/prescription', requireAuth, requireRole('admin', 'clinic_staff', 'doctor'), upload.single('file'), uploadPrescriptionFile);
router.get('/signed/:fileAssetId', requireAuth, getSignedUrl);
router.get('/', requireAuth, requireRole('admin'), listFileAssets);
router.delete('/:id', requireAuth, requireRole('admin'), deleteFileAsset);
export default router;
