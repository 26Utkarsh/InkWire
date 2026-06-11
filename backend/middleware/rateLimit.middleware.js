/**
 * @fileoverview rateLimit.middleware.js — Rate limiting for InkWire API endpoints.
 *
 * SECURITY (hardened):
 *  - Auth rate limit: 5 requests / 15 min per IP (was 10)
 *  - Login endpoint gets its own ultra-strict limiter: 3 attempts / 15 min
 *  - IPv6-mapped IPv4 normalization prevents bypassing by switching protocols
 */

import rateLimit from 'express-rate-limit';
import { RATE_LIMIT } from '../config/constants.js';

/**
 * Normalize request IP — converts IPv6-mapped IPv4 (::ffff:x.x.x.x) to plain IPv4.
 * Without this, an attacker can sometimes bypass per-IP limits by sending traffic
 * via IPv4 vs IPv6.
 * @param {import('express').Request} req
 * @returns {string}
 */
const normalizeIP = (req) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  // Strip IPv6-mapped IPv4 prefix
  return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
};

/**
 * Standard rate limiter for all public API endpoints
 */
export const rateLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: normalizeIP,
  message: {
    success: false,
    message: 'Too many requests — please try again later',
  },
});

/**
 * Stricter rate limiter for auth endpoints (brute-force protection).
 * Applied to the entire /auth route group.
 * 5 requests per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,     // 15 min
  max: 5,                              // was 10 — halved
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,       // count successful logins too (prevents abuse)
  keyGenerator: normalizeIP,
  message: {
    success: false,
    message: 'Too many login attempts — please try again in 15 minutes',
  },
});

/**
 * Ultra-strict rate limiter applied exclusively to POST /auth/login.
 * Only 3 attempts per 15 minutes per IP — matches the account lockout threshold.
 * A coordinated brute-force from a single IP hits this wall immediately.
 */
export const loginRateLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,     // 15 min
  max: 3,                              // 3 strikes per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,        // only count failed attempts
  keyGenerator: normalizeIP,
  message: {
    success: false,
    message: 'Too many login attempts from this IP — please wait 15 minutes',
  },
});

