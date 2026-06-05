/**
 * @fileoverview auth.controller.js — Admin authentication controller for InkWire.
 * SECURITY: JWT issued as HttpOnly, Secure, SameSite=Strict cookie — never in response body.
 * Short-lived access token (15m). Cookie cleared on logout server-side.
 */

import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { logger } from '../utils/logger.js';
import { AUTH } from '../config/constants.js';

/** Cookie name — consistent across login / logout / middleware */
export const AUTH_COOKIE = 'inkwire_admin_token';

/** Cookie options — HttpOnly blocks JS access, Secure forces HTTPS, SameSite=Strict prevents CSRF */
const COOKIE_OPTIONS = {
  httpOnly: true,                                  // ← cannot be read by JavaScript (blocks XSS theft)
  secure: process.env.NODE_ENV === 'production',   // ← HTTPS only in production
  sameSite: 'strict',                              // ← blocks cross-site request forgery
  maxAge: 15 * 60 * 1000,                          // ← 15 minutes, matches JWT expiry
  path: '/',
};

/**
 * Admin login — verify credentials and issue HttpOnly JWT cookie
 * @param {import('express').Request} req
 * @param {import('express').Response} res
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
      { id: admin._id.toString(), email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: AUTH.JWT_EXPIRES_IN }
    );

    // Set token as HttpOnly cookie — browser sends it automatically, JS cannot read it
    res.cookie(AUTH_COOKIE, token, COOKIE_OPTIONS);

    logger.info(`[AUTH] Admin logged in: ${email}`);

    // Return success confirmation only — NOT the token itself
    return res.json({
      success: true,
      message: 'Logged in successfully',
      admin: { email: admin.email },
    });
  } catch (err) {
    logger.error(`[AUTH] login failed: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

/**
 * Verify current session (cookie-based)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const verifyToken = (req, res) => {
  // req.admin is populated by the verifyToken middleware
  res.json({ success: true, admin: { email: req.admin.email } });
};

/**
 * Logout — clear the cookie server-side
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const logout = (_req, res) => {
  res.clearCookie(AUTH_COOKIE, { ...COOKIE_OPTIONS, maxAge: 0 });
  res.json({ success: true, message: 'Logged out successfully' });
};

/**
 * Seed admin user from environment variables (run once on first start)
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
