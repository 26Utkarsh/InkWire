/**
 * @fileoverview rateLimit.middleware.js — Rate limiting for InkWire API endpoints.
 * Uses express-rate-limit to prevent abuse.
 */

import rateLimit from 'express-rate-limit';
import { RATE_LIMIT } from '../config/constants.js';

/**
 * Standard rate limiter for all public API endpoints
 */
export const rateLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests — please try again later',
  },
});

/**
 * Stricter rate limiter for auth endpoints (prevent brute force)
 */
export const authRateLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts — please try again in 15 minutes',
  },
});
