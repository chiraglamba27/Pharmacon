import { Router } from 'express';
import { getTeam, getRoadmap, getOverview } from '../controllers/project.controller.js';

const router = Router();
// All public — no auth required
router.get('/team', getTeam);
router.get('/roadmap', getRoadmap);
router.get('/overview', getOverview);
export default router;
