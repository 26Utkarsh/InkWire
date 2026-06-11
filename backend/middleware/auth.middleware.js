/**
 * @fileoverview auth.middleware.js — JWT verification middleware for InkWire admin routes.
 *
 * SECURITY (hardened):
 *  - Token is ONLY accepted from the HttpOnly cookie — NEVER from Authorization header.
 *    This means: even if someone steals the raw token string, they cannot use it from
 *    a script/curl/Postman — the browser is the only thing that can send it.
 *  - JWT error details are never exposed in the response (no "jwt expired" / "invalid
 *    signature" leakage that helps attackers understand what to try next).
 */

import jwt from 'jsonwebtoken';
import { AUTH_COOKIE } from '../controllers/auth.controller.js';
import { logger } from '../utils/logger.js';

/**
 * Verify JWT exclusively from the HttpOnly cookie.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const verifyToken = (req, res, next) => {
  try {
    // Read ONLY from HttpOnly cookie — JavaScript (and attackers) cannot access this
    const token = req.cookies?.[AUTH_COOKIE];

    // Do NOT fall back to Authorization header.
    // Rationale: Bearer tokens in headers can be sent by any script/tool. The entire
    // point of HttpOnly cookies is that only the browser (with the actual session) can
    // send the token. Accepting a header fallback undermines this completely.
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    return next();
  } catch (_err) {
    // SECURITY: never expose the specific JWT error message to the client.
    // "jwt expired", "invalid signature", "jwt malformed" — all give attackers
    // information about what went wrong. Always return a generic message.
    logger.warn(`[AUTH] Token verification failed: ${_err.message}`);
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
};

