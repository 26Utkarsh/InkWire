/**
 * @fileoverview NewsletterService.js — Daily email digest to all InkWire subscribers.
 * Sends at 8:30 AM after morning articles publish.
 */

import nodemailer from 'nodemailer';
import { Newsletter } from '../models/Newsletter.js';
import { logger } from '../utils/logger.js';
import { EMAIL } from '../config/constants.js';

/** Create reusable transporter */
const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/**
 * Build HTML email template for the daily digest
 * @param {object[]} articles - Array of published article objects
 * @returns {string} HTML email string
 */
const buildDigestHTML = (articles) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const articleRows = articles.map((a) => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #e5e5e5;">
        <span style="background: #f1f1f1; color: #4a4a4a; font-size: 11px; font-family: sans-serif; padding: 2px 8px; border-radius: 2px; text-transform: uppercase; letter-spacing: 0.5px;">${a.topic}</span>
        <h3 style="font-family: 'Georgia', serif; font-size: 18px; color: #1a1a1a; margin: 8px 0 6px;">${a.headline}</h3>
        <p style="font-family: sans-serif; font-size: 14px; color: #6b7280; margin: 0 0 10px;">${a.summary || a.subheadline}</p>
        <a href="${frontendUrl}/article/${a.slug}" style="font-family: sans-serif; font-size: 13px; color: #000; font-weight: bold; text-decoration: none;">Read more →</a>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background: #f9f9f9;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9f9f9; padding: 24px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background: #fff; border: 1px solid #e5e5e5;">
              <!-- Header -->
              <tr>
                <td style="padding: 28px 32px; border-bottom: 3px solid #000;">
                  <h1 style="font-family: 'Georgia', serif; font-size: 28px; color: #1a1a1a; margin: 0;">InkWire</h1>
                  <p style="font-family: sans-serif; font-size: 13px; color: #6b7280; margin: 4px 0 0;">Daily Brief — ${today}</p>
                </td>
              </tr>
              <!-- Articles -->
              <tr>
                <td style="padding: 8px 32px 24px;">
                  <p style="font-family: sans-serif; font-size: 14px; color: #4a4a4a; margin: 20px 0 16px;">Today's top stories from InkWire:</p>
                  <table width="100%" cellpadding="0" cellspacing="0">${articleRows}</table>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 32px; background: #f9f9f9; border-top: 1px solid #e5e5e5;">
                  <p style="font-family: sans-serif; font-size: 12px; color: #9ca3af; margin: 0;">
                    <a href="${frontendUrl}" style="color: #000; text-decoration: none;">Visit InkWire</a> &nbsp;·&nbsp;
                    <a href="${frontendUrl}/unsubscribe?email={{EMAIL}}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Send daily digest to all active subscribers
 * @param {object[]} articles - Today's published articles (up to 6)
 * @returns {Promise<void>}
 */
export const sendDailyDigest = async (articles) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn('[NEWSLETTER] Email credentials not set — skipping digest');
      return;
    }

    const subscribers = await Newsletter.find({ active: true }).lean();
    if (subscribers.length === 0) {
      logger.info('[NEWSLETTER] No active subscribers — skipping digest');
      return;
    }

    const transporter = createTransporter();
    const today = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const topHeadline = articles[0]?.headline || 'Today\'s Top Stories';

    let sent = 0;
    for (const subscriber of subscribers) {
      try {
        const html = buildDigestHTML(articles).replace('{{EMAIL}}', subscriber.email);
        await transporter.sendMail({
          from: EMAIL.FROM,
          to: subscriber.email,
          subject: `${EMAIL.SUBJECTS.NEWSLETTER} — ${today} | ${topHeadline}`,
          html,
        });
        sent++;
      } catch (err) {
        logger.warn(`[NEWSLETTER] Failed to send to ${subscriber.email}: ${err.message}`);
      }
    }

    logger.info(`[NEWSLETTER] Digest sent to ${sent}/${subscribers.length} subscribers`);
  } catch (err) {
    logger.error(`[NEWSLETTER] sendDailyDigest failed: ${err.message}`);
  }
};

/**
 * Add new subscriber to newsletter list
 * @param {string} email - Subscriber email address
 * @param {string} source - Where they signed up from
 * @returns {Promise<boolean>} true if new, false if already subscribed
 */
export const subscribe = async (email, source = 'homepage') => {
  try {
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (!existing.active) {
        existing.active = true;
        await existing.save();
        return true;
      }
      return false;
    }

    await Newsletter.create({ email, source });
    logger.info(`[NEWSLETTER] New subscriber: ${email}`);
    return true;
  } catch (err) {
    logger.error(`[NEWSLETTER] subscribe failed: ${err.message}`);
    throw err;
  }
};

/**
 * Unsubscribe an email from newsletter
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export const unsubscribe = async (email) => {
  try {
    const subscriber = await Newsletter.findOne({ email });
    if (!subscriber) return false;
    subscriber.active = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();
    logger.info(`[NEWSLETTER] Unsubscribed: ${email}`);
    return true;
  } catch (err) {
    logger.error(`[NEWSLETTER] unsubscribe failed: ${err.message}`);
    throw err;
  }
};
