/**
 * @fileoverview auth.controller.js — Admin authentication controller for InkWire.
 * Handles login, logout, and token verification.
 */

import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { logger } from '../utils/logger.js';
import { AUTH } from '../config/constants.js';

/**
 * Admin login — verify credentials and issue JWT token
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (admin.isLocked()) {
      const minutesLeft = Math.ceil((admin.lockedUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        message: `Account locked. Try again in ${minutesLeft} minutes.`,
      });
    }

    const isValid = await admin.verifyPassword(password);
    if (!isValid) {
      await admin.incrementLoginAttempts();
      logger.warn(`[AUTH] Failed login attempt for: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await admin.resetLoginAttempts();

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: AUTH.JWT_EXPIRES_IN }
    );

    logger.info(`[AUTH] Admin logged in: ${email}`);
    return res.json({
      success: true,
      token,
      expiresIn: AUTH.JWT_EXPIRES_IN,
    });
  } catch (err) {
    logger.error(`[AUTH] login failed: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

/**
 * Verify current token validity
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {void}
 */
export const verifyToken = (req, res) => {
  res.json({ success: true, admin: req.admin });
};

/**
 * Logout — client-side token removal (JWT is stateless)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {void}
 */
export const logout = (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

/**
 * Seed admin user from environment variables (run once on first start)
 * @returns {Promise<void>}
 */
export const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      logger.warn('[AUTH] ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping seed');
      return;
    }

    const exists = await Admin.findOne({ email });
    if (exists) return;

    await Admin.create({ email, passwordHash: password });
    logger.info(`[AUTH] Admin user created: ${email}`);
  } catch (err) {
    logger.error(`[AUTH] seedAdmin failed: ${err.message}`);
  }
};
