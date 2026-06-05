/**
 * @fileoverview server.js — Express application entry point for InkWire backend.
 * Initializes middleware, mounts routes, connects to DB, starts scheduler.
 */

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import { connectDB } from './config/db.js';
import { rateLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { router as apiRouter } from './routes/index.js';
import { initScheduler } from './services/SchedulerService.js';
import { logger } from './utils/logger.js';
import { SERVER } from './config/constants.js';

const app = express();

/** Disable X-Powered-By to hide server technology */
app.disable('x-powered-by');

/** Apply comprehensive security headers via Helmet */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https://images.unsplash.com', 'https://pagead2.googlesyndication.com'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

/** Configure CORS — only accept requests from known frontend origin */
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
    ];
    if (!origin || allowed.includes(origin.replace(/\/$/, ''))) return callback(null, true);
    return callback(new Error('CORS: Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/** Parse JSON bodies with size limit */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/** Sanitize MongoDB query injection */
app.use(mongoSanitize());

/** Prevent HTTP parameter pollution */
app.use(hpp());

/** Global rate limiting */
app.use('/api', rateLimiter);

/** Mount API routes */
app.use('/api/v1', apiRouter);

/** Health check endpoint */
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

/** 404 handler — catches undefined routes */
app.use(notFoundHandler);

/** Global error handler — must be last */
app.use(errorHandler);

/**
 * Bootstrap the application — connect DB, start scheduler, listen
 */
const bootstrap = async () => {
  try {
    await connectDB();
    initScheduler();
    app.listen(SERVER.PORT, () => {
      logger.info(`[SERVER] InkWire backend running on port ${SERVER.PORT}`);
    });
  } catch (err) {
    logger.error(`[SERVER] Bootstrap failed: ${err.message}`);
    process.exit(1);
  }
};

bootstrap();
