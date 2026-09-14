import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  getMyCalibrationProfile, getDoctorCalibrationProfile,
  uploadCalibrationSample, getMySamples, verifySample,
} from '../controllers/calibration.controller.js';

const router = Router();
router.get('/profile', requireAuth, requireRole('doctor'), getMyCalibrationProfile);
router.get('/profile/:doctorId', requireAuth, requireRole('admin'), getDoctorCalibrationProfile);
router.post('/samples', requireAuth, requireRole('doctor'), uploadCalibrationSample);
router.get('/samples', requireAuth, requireRole('doctor'), getMySamples);
router.patch('/samples/:id/verify', requireAuth, requireRole('admin'), verifySample);
export default router;
