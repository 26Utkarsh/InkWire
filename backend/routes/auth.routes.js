/**
 * @fileoverview auth.routes.js — Authentication endpoints for InkWire.
 */

import { Router } from 'express';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import { validateLogin } from '../middleware/validate.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { login, logout, verifyToken as verifyTokenCtrl } from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.post('/login', authRateLimiter, validateLogin, login);
authRouter.post('/logout', logout);
authRouter.get('/verify', verifyToken, verifyTokenCtrl);
