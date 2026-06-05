/**
 * @fileoverview EmailService.js — Email notifications for InkWire.
 * Sends: admin review alerts, publish reminders, test emails, newsletter digests.
 */

import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

/** Create Gmail transporter from environment credentials */
const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/** Check if email is configured */
const isEmailConfigured = () =>
  !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

/** Shared email sender */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!isEmailConfigured()) {
    logger.warn('[EMAIL] Credentials not set — skipping email');
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"InkWire Editorial" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    });
    logger.info(`[EMAIL] Sent: "${subject}" → ${to}`);
  } catch (err) {
    logger.error(`[EMAIL] Failed: ${err.message}`);
    throw err;
  }
};

/** Shared email wrapper styles */
const emailStyles = `
  font-family: 'Georgia', serif;
  max-width: 620px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  overflow: hidden;
`;

const emailHeader = `
  <div style="background: #111111; padding: 24px 32px;">
    <h1 style="font-family: Georgia, serif; font-size: 28px; color: #ffffff; margin: 0; letter-spacing: -0.02em;">InkWire</h1>
    <p style="font-size: 12px; color: #9ca3af; margin: 4px 0 0; font-family: sans-serif; letter-spacing: 0.06em; text-transform: uppercase;">Editorial System</p>
  </div>
`;

/** Build one article row for the email */
const articleRow = (article, index) => `
  <div style="padding: 16px 0; border-bottom: 1px solid #f0f0f0; display: flex; gap: 12px;">
    <div style="background: #f5f5f5; color: #666; font-size: 11px; font-weight: 700; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: sans-serif; padding-top: 1px; text-align: center; line-height: 24px;">
      ${index + 1}
    </div>
    <div>
      <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af; font-family: sans-serif; margin-bottom: 4px;">
        ${article.topic || 'General'} · ${(article.scheduledFor || 'morning').charAt(0).toUpperCase() + (article.scheduledFor || 'morning').slice(1)}
      </div>
      <div style="font-size: 16px; font-weight: 600; color: #1a1a1a; line-height: 1.3; margin-bottom: 4px;">
        ${article.headline}
      </div>
      ${article.summary ? `<div style="font-size: 13px; color: #6b7280; line-height: 1.4; font-family: sans-serif;">${article.summary.slice(0, 120)}...</div>` : ''}
    </div>
  </div>
`;

/**
 * Send admin alert when daily articles are ready for review.
 * @param {object[]} articles
 */
export const sendAdminAlert = async (articles) => {
  const adminEmail = process.env.EMAIL_TO || process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const morning   = articles.filter((a) => a.scheduledFor === 'morning');
  const afternoon = articles.filter((a) => a.scheduledFor === 'afternoon');
  const evening   = articles.filter((a) => a.scheduledFor === 'evening');

  const slotSection = (label, emoji, time, items) => items.length === 0 ? '' : `
    <div style="margin-top: 24px;">
      <div style="font-family: sans-serif; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 8px;">
        ${emoji} ${label} — publishes at ${time}
      </div>
      ${items.map((a, i) => articleRow(a, i)).join('')}
    </div>
  `;

  const html = `
    <div style="${emailStyles}">
      ${emailHeader}
      <div style="padding: 28px 32px;">
        <p style="font-size: 14px; color: #6b7280; font-family: sans-serif; margin: 0 0 8px;">${dateStr}</p>
        <h2 style="font-size: 22px; color: #1a1a1a; margin: 0 0 8px;">
          ${articles.length} article${articles.length !== 1 ? 's' : ''} ready for review
        </h2>
        <p style="font-size: 15px; color: #4a4a4a; margin: 0 0 24px; line-height: 1.6;">
          InkWire's AI has generated today's articles. Please review and approve each one before its publish window.
          <strong>Unapproved articles will not be published.</strong>
        </p>

        <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 4px; padding: 12px 16px; margin-bottom: 24px; font-family: sans-serif;">
          <p style="font-size: 13px; color: #c2410c; margin: 0;">
            ⏰ <strong>Publishing windows:</strong> Morning 8:00 AM · Afternoon 1:00 PM · Evening 7:00 PM
          </p>
        </div>

        ${slotSection('Morning', '🌅', '8:00 AM', morning)}
        ${slotSection('Afternoon', '☀️', '1:00 PM', afternoon)}
        ${slotSection('Evening', '🌆', '7:00 PM', evening)}

        <div style="margin-top: 32px; text-align: center;">
          <a href="${frontendUrl}/admin/queue"
             style="background: #111111; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-family: sans-serif; font-size: 14px; font-weight: 600; display: inline-block;">
            Review Articles in Dashboard →
          </a>
        </div>
      </div>
      <div style="padding: 16px 32px; border-top: 1px solid #f0f0f0; font-family: sans-serif; font-size: 11px; color: #9ca3af;">
        This is an automated message from InkWire Editorial System. Do not reply.
      </div>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `✍️ InkWire: ${articles.length} articles ready for review — ${dateStr}`,
    html,
    text: `InkWire generated ${articles.length} articles. Review at: ${frontendUrl}/admin/queue`,
  });
};

/**
 * Send reminder when publish window is approaching and articles are unapproved.
 * @param {string} slot
 * @param {object[]} pendingArticles
 */
export const sendPublishReminder = async (slot, pendingArticles) => {
  const adminEmail = process.env.EMAIL_TO || process.env.ADMIN_EMAIL;
  if (!adminEmail || pendingArticles.length === 0) return;

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const SLOT_TIMES = { morning: '8:00 AM', afternoon: '1:00 PM', evening: '7:00 PM' };

  const html = `
    <div style="${emailStyles}">
      ${emailHeader}
      <div style="padding: 28px 32px;">
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
          <h2 style="font-size: 18px; color: #dc2626; margin: 0 0 8px; font-family: sans-serif;">
            ⏰ Publishing in 30 minutes — ${slot.charAt(0).toUpperCase() + slot.slice(1)} slot (${SLOT_TIMES[slot]})
          </h2>
          <p style="font-size: 13px; color: #7f1d1d; margin: 0; font-family: sans-serif;">
            ${pendingArticles.length} article${pendingArticles.length !== 1 ? 's' : ''} ${pendingArticles.length !== 1 ? 'are' : 'is'} still awaiting approval.
          </p>
        </div>

        <div style="margin-bottom: 24px;">
          ${pendingArticles.map((a, i) => articleRow(a, i)).join('')}
        </div>

        <a href="${frontendUrl}/admin/queue"
           style="background: #dc2626; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-family: sans-serif; font-size: 14px; font-weight: 600; display: inline-block;">
          Review Now →
        </a>
      </div>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `⏰ InkWire: ${pendingArticles.length} articles need approval before ${SLOT_TIMES[slot]}`,
    html,
    text: `${slot} slot publishes at ${SLOT_TIMES[slot]}. ${pendingArticles.length} articles pending. Review: ${frontendUrl}/admin/queue`,
  });
};

/**
 * Send a test email to verify configuration works.
 */
export const sendTestEmail = async () => {
  const adminEmail = process.env.EMAIL_TO || process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new Error('EMAIL_TO or ADMIN_EMAIL not set');

  const html = `
    <div style="${emailStyles}">
      ${emailHeader}
      <div style="padding: 28px 32px;">
        <h2 style="color: #059669; font-size: 20px; margin: 0 0 12px;">✅ Email is working!</h2>
        <p style="font-size: 15px; color: #4a4a4a; font-family: sans-serif; line-height: 1.6; margin: 0 0 16px;">
          Your InkWire email notifications are correctly configured. You will receive:
        </p>
        <ul style="font-family: sans-serif; font-size: 14px; color: #4a4a4a; line-height: 2; padding-left: 20px;">
          <li>📰 Daily review alerts at ~5:00 AM when articles are generated</li>
          <li>⏰ 30-minute reminders before each publish window</li>
        </ul>
      </div>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: '✅ InkWire Email Test — Configuration Working',
    html,
    text: 'InkWire email is correctly configured. You will receive daily review alerts and publish reminders.',
  });
};

/**
 * Send notification when articles are auto-published after 30-min deadline.
 * @param {object[]} articles — Articles with aiScore, verdict, imageOk, issues
 */
export const sendAutoPublishNotification = async (articles) => {
  const adminEmail = process.env.EMAIL_TO || process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const articleCards = articles.map((a) => `
    <div style="border: 1px solid #d1fae5; border-radius: 6px; padding: 16px; margin-bottom: 12px; background: #f0fdf4;">
      <div style="font-family: sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #059669; margin-bottom: 6px;">
        ✅ Auto-Published · Score ${a.aiScore}/100 · ${a.imageOk ? '🖼️ Image OK' : '⚠️ Image Issue'}
      </div>
      <div style="font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; line-height: 1.3;">
        ${a.headline}
      </div>
      <div style="font-family: sans-serif; font-size: 13px; color: #6b7280; margin-bottom: 8px; font-style: italic;">
        ${a.verdict || ''}
      </div>
      ${a.issues?.length > 0 ? `
        <div style="font-family: sans-serif; font-size: 12px; color: #92400e; background: #fef3c7; padding: 8px 10px; border-radius: 4px;">
          ⚠️ Minor notes: ${a.issues.join(' · ')}
        </div>` : ''}
      <a href="${frontendUrl}/article/${a.slug}" 
         style="display: inline-block; margin-top: 10px; font-family: sans-serif; font-size: 12px; color: #059669; text-decoration: underline;">
        View published article →
      </a>
    </div>
  `).join('');

  const html = `
    <div style="${emailStyles}">
      ${emailHeader}
      <div style="padding: 28px 32px;">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
          <h2 style="font-size: 18px; color: #065f46; margin: 0 0 6px; font-family: sans-serif;">
            🤖 InkWire Auto-Published ${articles.length} Article${articles.length !== 1 ? 's' : ''}
          </h2>
          <p style="font-family: sans-serif; font-size: 13px; color: #065f46; margin: 0;">
            You didn't review the article${articles.length !== 1 ? 's' : ''} within 30 minutes, so InkWire's AI reviewed and published ${articles.length !== 1 ? 'them' : 'it'} automatically.
            <br/><strong>Time:</strong> ${now} IST
          </p>
        </div>

        ${articleCards}

        <div style="margin-top: 24px; padding: 14px 16px; background: #f8f8f8; border-radius: 6px; font-family: sans-serif; font-size: 13px; color: #6b7280;">
          💡 To disable auto-publish or change the 30-minute window, visit your admin settings.
          <a href="${frontendUrl}/admin/published" style="color: #3b82f6; margin-left: 8px;">View all published →</a>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `🤖 InkWire Auto-Published ${articles.length} Article${articles.length !== 1 ? 's' : ''} — ${now} IST`,
    html,
    text: `InkWire auto-published ${articles.length} article(s) at ${now} IST. Review at: ${frontendUrl}/admin/published`,
  });
};

/**
 * Send urgent alert when auto-review finds issues that prevent auto-publishing.
 * @param {object} article — Article with aiScore, verdict, imageOk, issues
 */
export const sendAutoReviewFailed = async (article) => {
  const adminEmail = process.env.EMAIL_TO || process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  const issuesList = article.issues?.map((issue) => `
    <li style="font-family: sans-serif; font-size: 13px; color: #7f1d1d; padding: 4px 0;">⚠️ ${issue}</li>
  `).join('') || '';

  const html = `
    <div style="${emailStyles}">
      ${emailHeader}
      <div style="padding: 28px 32px;">
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
          <h2 style="font-size: 18px; color: #dc2626; margin: 0 0 6px; font-family: sans-serif;">
            ⚠️ Article Needs Your Manual Review
          </h2>
          <p style="font-family: sans-serif; font-size: 13px; color: #7f1d1d; margin: 0;">
            InkWire's AI reviewed this article but found issues that prevent automatic publishing.
            <strong>AI Score: ${article.aiScore}/100</strong> (minimum 75 required).
          </p>
        </div>

        <div style="border: 1px solid #e5e5e5; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
          <div style="font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 6px;">
            ${article.topic || ''} · ${article.scheduledFor || ''}
          </div>
          <div style="font-family: Georgia, serif; font-size: 18px; font-weight: 700; color: #1a1a1a; line-height: 1.3; margin-bottom: 8px;">
            ${article.headline}
          </div>
          <div style="font-family: sans-serif; font-size: 13px; color: #6b7280; font-style: italic;">
            AI verdict: "${article.verdict || 'Review required'}"
          </div>
        </div>

        ${issuesList ? `
        <div style="margin-bottom: 20px;">
          <div style="font-family: sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #dc2626; margin-bottom: 8px;">
            Issues Found:
          </div>
          <ul style="margin: 0; padding-left: 0; list-style: none;">
            ${issuesList}
          </ul>
        </div>` : ''}

        <div style="text-align: center; margin-top: 24px;">
          <a href="${frontendUrl}/admin/queue"
             style="background: #dc2626; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-family: sans-serif; font-size: 14px; font-weight: 600; display: inline-block;">
            Review Article Now →
          </a>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `⚠️ InkWire: Article needs review — "${article.headline.slice(0, 50)}"`,
    html,
    text: `Article "${article.headline}" scored ${article.aiScore}/100 and needs manual review. Open: ${frontendUrl}/admin/queue`,
  });
};

