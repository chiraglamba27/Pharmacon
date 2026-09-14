import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

router.get('/', async (_req, res) => {
  let dbStatus = 'ok';
  try {
    await supabaseAdmin.from('profiles').select('id').limit(1);
  } catch {
    dbStatus = 'error';
  }

  res.json({
    status: 'ok',
    service: 'Pharmacon API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

export default router;
