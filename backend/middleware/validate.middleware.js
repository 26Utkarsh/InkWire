/**
 * @fileoverview validate.middleware.js — Request validation middleware for InkWire.
 * SECURITY: All inputs have max-length caps to prevent DoS via oversized payloads.
 *           These are belt-and-suspenders guards on top of the 10kb body size limit.
 */

/**
 * Validate email subscription request
 */
export const validateSubscription = (req, res, next) => {
  const { email } = req.body;
  // RFC 5321 max email length is 254 chars
  const emailRegex = /^\S+@\S+\.\S+$/;

  if (!email || typeof email !== 'string' || email.length > 254 || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Valid email address is required' });
  }
  return next();
};

/**
 * Validate admin login request.
 * SECURITY: Length caps prevent oversized payloads hitting bcrypt (bcrypt has a 72-byte input limit;
 * extremely long passwords can cause CPU DoS without this guard).
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || email.length > 254) {
    return res.status(400).json({ success: false, message: 'Valid email is required' });
  }
  if (!password || typeof password !== 'string' || password.length > 72 || password.length < 8) {
    return res.status(400).json({ success: false, message: 'Valid password is required' });
  }
  return next();
};

/**
 * Validate article edit request body.
 * SECURITY: Length caps prevent mass-payload attacks; type checks block prototype pollution.
 */
export const validateArticleEdit = (req, res, next) => {
  const { headline, body } = req.body;

  if (!headline || typeof headline !== 'string' || headline.trim().length < 5 || headline.length > 500) {
    return res.status(400).json({ success: false, message: 'Headline must be 5–500 characters' });
  }
  if (!body || typeof body !== 'string' || body.trim().length < 100 || body.length > 50000) {
    return res.status(400).json({ success: false, message: 'Article body must be 100–50,000 characters' });
  }
  return next();
};
