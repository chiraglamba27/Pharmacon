import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import projectRouter from './routes/project.js';
import deliverablesRouter from './routes/deliverables.js';
import filesRouter from './routes/files.js';
import prescriptionsRouter from './routes/prescriptions.js';
import inventoryRouter from './routes/inventory.js';
import auditRouter from './routes/audit.js';
import refillsRouter from './routes/refills.js';
import calibrationRouter from './routes/calibration.js';

import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── Security & Utility Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/project', projectRouter);
app.use('/api/deliverables', deliverablesRouter);
app.use('/api/files', filesRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/audit', auditRouter);
app.use('/api/refills', refillsRouter);
app.use('/api/calibration', calibrationRouter);

// ─── 404 & Error Handling ──────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

if (NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Pharmacon API running on port ${PORT} [${NODE_ENV}]`);
  });
}

export default app;
