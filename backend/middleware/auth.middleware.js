/**
 * @fileoverview auth.middleware.js — JWT verification middleware for InkWire admin routes.
 * Attaches decoded admin payload to req.admin on success.
 */

import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

/**
 * Verify JWT token from Authorization header
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    return next();
  } catch (err) {
    logger.warn(`[AUTH] Token verification failed: ${err.message}`);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
