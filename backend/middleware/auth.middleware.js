/**
 * @fileoverview auth.middleware.js — JWT verification middleware for InkWire admin routes.
 * SECURITY: Reads token from HttpOnly cookie (not Authorization header).
 * Cookie is set by the login endpoint — JavaScript cannot access it.
 */

import jwt from 'jsonwebtoken';
import { AUTH_COOKIE } from '../controllers/auth.controller.js';
import { logger } from '../utils/logger.js';

/**
 * Verify JWT from HttpOnly cookie.
 * Falls back to Authorization header for backward compatibility with any existing scripts.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const verifyToken = (req, res, next) => {
  try {
    // Primary: read from HttpOnly cookie (XSS-safe)
    let token = req.cookies?.[AUTH_COOKIE];

    // Fallback: Authorization header (for scripts / API testing)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    return next();
  } catch (err) {
    logger.warn(`[AUTH] Token verification failed: ${err.message}`);
    return res.status(401).json({ success: false, message: 'Session expired — please log in again' });
  }
};
