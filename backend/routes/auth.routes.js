/**
 * @fileoverview auth.routes.js — Authentication endpoints for InkWire.
 *
 * SECURITY layers on POST /login:
 *  1. authRateLimiter   — 5 requests / 15 min per IP (all requests)
 *  2. loginRateLimiter  — 3 failed attempts / 15 min per IP (failed only)
 *  3. validateLogin     — input sanitisation (type, length, format)
 *  4. account lockout   — 3 wrong passwords → 30 min DB-level lock (model)
 */

import { Router } from 'express';
import { authRateLimiter, loginRateLimiter } from '../middleware/rateLimit.middleware.js';
import { validateLogin } from '../middleware/validate.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { login, logout, verifyToken as verifyTokenCtrl } from '../controllers/auth.controller.js';

export const authRouter = Router();

// POST /auth/login — triple-layered rate protection + validation + account lockout
authRouter.post('/login', authRateLimiter, loginRateLimiter, validateLogin, login);
authRouter.post('/logout', logout);
authRouter.get('/verify', verifyToken, verifyTokenCtrl);

