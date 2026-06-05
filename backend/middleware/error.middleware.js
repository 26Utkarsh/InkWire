/**
 * @fileoverview error.middleware.js — Global error handler for InkWire Express app.
 * SECURITY: Never leaks stack traces, DB errors, or internal paths to clients.
 * Logs full details server-side only.
 */

import { logger } from '../utils/logger.js';

/** Safe user-facing messages for known HTTP status codes */
const SAFE_MESSAGES = {
  400: 'Bad request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not found',
  429: 'Too many requests — please try again later',
  500: 'Internal server error',
};

/**
 * Global error handling middleware.
 * Express recognizes error handlers by their 4-parameter signature.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export const errorHandler = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;

  /** Log full details server-side for debugging */
  logger.error(`[ERROR] ${req.method} ${req.path} ${status} — ${err.message}`);

  /** Return only a safe generic message — never stack trace or DB details */
  const clientMessage = SAFE_MESSAGES[status] || SAFE_MESSAGES[500];

  res.status(status).json({
    success: false,
    message: clientMessage,
  });
};

/**
 * 404 handler — for routes that don't exist.
 * Mount immediately before errorHandler in server.js.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
};
