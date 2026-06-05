/**
 * @fileoverview validate.middleware.js — Request validation middleware for InkWire.
 * Validates required fields and formats before reaching controllers.
 */

/**
 * Validate email subscription request
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const validateSubscription = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^\S+@\S+\.\S+$/;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Valid email address is required' });
  }
  return next();
};

/**
 * Validate admin login request
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  return next();
};

/**
 * Validate article edit request body
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const validateArticleEdit = (req, res, next) => {
  const { headline, body } = req.body;

  if (!headline || typeof headline !== 'string' || headline.trim().length < 5) {
    return res.status(400).json({ success: false, message: 'Valid headline is required' });
  }
  if (!body || typeof body !== 'string' || body.trim().length < 100) {
    return res.status(400).json({ success: false, message: 'Article body must be at least 100 characters' });
  }
  return next();
};
