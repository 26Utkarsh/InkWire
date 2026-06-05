/**
 * @fileoverview newsletter.controller.js — Newsletter subscription controller for InkWire.
 */

import { subscribe, unsubscribe, sendDailyDigest } from '../services/NewsletterService.js';
import { Article } from '../models/Article.js';
import { logger } from '../utils/logger.js';

/**
 * Subscribe new email to newsletter
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email, source } = req.body;
    const isNew = await subscribe(email, source);
    const message = isNew ? 'Successfully subscribed!' : 'Already subscribed';
    res.json({ success: true, message });
  } catch (err) {
    logger.error(`[NEWSLETTER CTRL] subscribeNewsletter: ${err.message}`);
    res.status(500).json({ success: false, message: 'Subscription failed' });
  }
};

/**
 * Unsubscribe email from newsletter
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    await unsubscribe(email);
    res.json({ success: true, message: 'Successfully unsubscribed' });
  } catch (err) {
    logger.error(`[NEWSLETTER CTRL] unsubscribeNewsletter: ${err.message}`);
    res.status(500).json({ success: false, message: 'Unsubscribe failed' });
  }
};

/**
 * Manually trigger newsletter send (admin only)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export const sendNewsletter = async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(6)
      .lean();

    res.json({ success: true, message: 'Newsletter sending in background' });
    sendDailyDigest(articles).catch((err) =>
      logger.error(`[NEWSLETTER CTRL] sendNewsletter background: ${err.message}`)
    );
  } catch (err) {
    logger.error(`[NEWSLETTER CTRL] sendNewsletter: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to send newsletter' });
  }
};
