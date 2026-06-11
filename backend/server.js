/**
 * @fileoverview server.js — Express application entry point for InkWire backend.
 * SECURITY HARDENING: cookie-parser, strict CSP with font-src/frame-ancestors/formAction,
 * Permissions-Policy, layered rate limits.
 */

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import { connectDB } from './config/db.js';
import { rateLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { router as apiRouter } from './routes/index.js';
import { initScheduler, publishPassedSlots } from './services/SchedulerService.js';
import { logger } from './utils/logger.js';
import { SERVER } from './config/constants.js';

const app = express();

/** Disable X-Powered-By to hide server technology */
app.disable('x-powered-by');

// ── Trust proxy for rate-limit IP detection (Render, Heroku, etc.) ──────────
app.set('trust proxy', 1);

/** Comprehensive security headers via Helmet */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:      ["'self'"],
      scriptSrc:       ["'self'", 'https://pagead2.googlesyndication.com'],
      styleSrc:        ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:         ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:          [
        "'self'", 'data:',
        'https://images.unsplash.com',
        'https://pagead2.googlesyndication.com',
      ],
      connectSrc:      ["'self'"],
      frameSrc:        ["'none'"],
      frameAncestors:  ["'none'"],           // ← prevents clickjacking via iframes
      objectSrc:       ["'none'"],
      formAction:      ["'self'"],           // ← form submissions only to own origin
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,        // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,             // X-Content-Type-Options: nosniff
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

/** Permissions-Policy — disable unused browser features (camera, microphone, geolocation) */
app.use((_req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );
  next();
});

/** Configure CORS — only accept requests from known frontend origin */
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
    ];
    if (!origin || allowed.includes(origin.replace(/\/$/, ''))) return callback(null, true);
    return callback(new Error('CORS: Origin not allowed'));
  },
  credentials: true,           // ← required for cookies to be sent cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/** Parse JSON bodies with size limit (increased to 50mb to support multiple high-res mobile gallery uploads) */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/** Parse cookies — required for HttpOnly JWT cookie reading */
app.use(cookieParser());

/** Sanitize MongoDB query injection (strip $ and . from user input keys) */
app.use(mongoSanitize());

/** Prevent HTTP parameter pollution */
app.use(hpp());

/** CSRF Protection Middleware - Verify Origin/Referer for state-changing requests */
const csrfProtection = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const allowedOrigin = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

  if (origin && origin.replace(/\/$/, '') !== allowedOrigin) {
    logger.warn(`[SECURITY] CSRF blocked: invalid origin ${origin}`);
    return res.status(403).json({ success: false, message: 'Invalid origin (CSRF)' });
  }
  if (!origin && referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (refererOrigin.replace(/\/$/, '') !== allowedOrigin) {
        logger.warn(`[SECURITY] CSRF blocked: invalid referer ${referer}`);
        return res.status(403).json({ success: false, message: 'Invalid referer (CSRF)' });
      }
    } catch (e) {
      logger.warn(`[SECURITY] CSRF blocked: malformed referer ${referer}`);
      return res.status(403).json({ success: false, message: 'Invalid referer (CSRF)' });
    }
  }
  return next();
};

/** Global rate limiting */
app.use('/api', rateLimiter);

/** CSRF protection on all mutating API calls */
app.use('/api', csrfProtection);

/** Mount API routes */
app.use('/api/v1', apiRouter);

/** Health check — no auth required */
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

/** 404 handler */
app.use(notFoundHandler);

/** Global error handler — must be last */
app.use(errorHandler);

const bootstrap = async () => {
  try {
    await connectDB();
    initScheduler();
    await publishPassedSlots();
    app.listen(SERVER.PORT, () => {
      logger.info(`[SERVER] InkWire backend running on port ${SERVER.PORT}`);
    });
  } catch (err) {
    logger.error(`[SERVER] Bootstrap failed: ${err.message}`);
    process.exit(1);
  }
};

bootstrap();
