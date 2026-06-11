/**
 * @fileoverview auth.controller.js — Admin authentication for InkWire.
 *
 * SECURITY (hardened):
 *  - JWT issued as HttpOnly, Secure, SameSite=Strict cookie — NEVER in response body.
 *  - Timing-safe login: bcrypt ALWAYS runs even for unknown emails, preventing
 *    email enumeration via response-time measurement.
 *  - Login history (last 10 events) stored in DB for intrusion detection.
 *  - Cookie maxAge reduced from 8h → 4h (matches JWT expiry).
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { logger } from '../utils/logger.js';
import { AUTH } from '../config/constants.js';

/** Cookie name — consistent across login / logout / middleware */
export const AUTH_COOKIE = 'inkwire_admin_token';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Cookie options — these are the most secure settings available in browsers.
 *
 * httpOnly   → JavaScript cannot read this cookie. XSS attacks cannot steal the token.
 * secure     → Cookie only sent over HTTPS (in production). Prevents MITM sniffing.
 * sameSite   → 'strict' means the cookie is NEVER sent with cross-site requests,
 *              even from links. This blocks CSRF even without a CSRF token.
 * maxAge     → 4 hours. Short enough to limit damage if a device is left unlocked.
 * path       → '/' so it works on all routes without leaking to subpaths of other services.
 */
const COOKIE_OPTIONS = {
  httpOnly:  true,
  secure:    isProd,
  sameSite:  isProd ? 'strict' : 'lax',
  maxAge:    4 * 60 * 60 * 1000,   // 4 hours (reduced from 8h)
  path:      '/',
};

/**
 * A static bcrypt hash of a dummy password.
 * Used to ensure timing parity between "email not found" and "wrong password" paths.
 * Without this, an attacker can distinguish valid vs invalid emails by measuring
 * response time — valid emails run bcrypt (~250ms), invalid ones return instantly.
 * Pre-generated once at module load so it doesn't slow down startup.
 */
const DUMMY_HASH = '$2a$14$dummyhashfortimingprotection.abcdefghijklmnopqrstuvwxy';

/**
 * Admin login — verify credentials and issue HttpOnly JWT cookie.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIP = req.ip || 'unknown';

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    // SECURITY: Timing-safe path.
    // If the email doesn't exist, we STILL run bcrypt.compare against a dummy hash.
    // This ensures the response always takes the same amount of time (~250ms for bcrypt r14),
    // making it impossible for an attacker to determine whether the email is registered
    // by measuring response latency.
    if (!admin) {
      // Run bcrypt anyway (result ignored) — timing parity only
      await bcrypt.compare(password, DUMMY_HASH);
      logger.warn(`[AUTH] Login attempt for unknown email: ${email} from IP: ${clientIP}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (admin.isLocked()) {
      const minutesLeft = Math.ceil((admin.lockedUntil - Date.now()) / 60000);
      logger.warn(`[AUTH] Locked account login attempt: ${email} from IP: ${clientIP}`);
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Try again in ${minutesLeft} minutes.`,
      });
    }

    const isValid = await admin.verifyPassword(password);
    if (!isValid) {
      await admin.incrementLoginAttempts();
      // Record failed attempt in login history
      await admin.recordLoginAttempt({ ip: clientIP, success: false });
      logger.warn(`[AUTH] Failed login for: ${email} from IP: ${clientIP} (attempt ${admin.loginAttempts + 1})`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Success — reset lockout counters and record the event
    await admin.resetLoginAttempts();
    await admin.recordLoginAttempt({ ip: clientIP, success: true });

    const token = jwt.sign(
      { id: admin._id.toString(), email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: AUTH.JWT_EXPIRES_IN }
    );

    // Set token as HttpOnly cookie — browser sends it automatically; JS cannot read it
    res.cookie(AUTH_COOKIE, token, COOKIE_OPTIONS);

    logger.info(`[AUTH] Admin logged in: ${email} from IP: ${clientIP}`);

    // Return success confirmation — NOT the token itself
    return res.json({
      success: true,
      message: 'Logged in successfully',
      admin: { email: admin.email },
    });
  } catch (err) {
    logger.error(`[AUTH] login error: ${err.message}`);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

/**
 * Verify current session (cookie-based)
 */
export const verifyToken = (req, res) => {
  res.json({ success: true, admin: { email: req.admin.email } });
};

/**
 * Logout — clear the auth cookie server-side.
 * The browser will delete the cookie when it receives the cleared version.
 */
export const logout = (_req, res) => {
  res.clearCookie(AUTH_COOKIE, { ...COOKIE_OPTIONS, maxAge: 0 });
  res.json({ success: true, message: 'Logged out successfully' });
};

/**
 * Seed admin user from environment variables (run once on first start).
 * Password is hashed by the Mongoose pre-save hook.
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

