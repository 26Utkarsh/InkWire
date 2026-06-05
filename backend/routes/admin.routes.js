/**
 * @fileoverview admin.routes.js — All protected admin endpoints.
 * NEW: bulk actions, pin, slot override, test email, trigger publish.
 */

import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validateArticleEdit } from '../middleware/validate.middleware.js';
import {
  getQueue, getPublished, getStats, getSubscribers,
  approveArticle, rejectArticle, bulkApprove, bulkReject,
  editArticle, unpublishArticle, deleteArticle,
  togglePin, updateSlot,
  triggerGeneration, triggerPublish, testEmail,
} from '../controllers/admin.controller.js';
import { sendNewsletter } from '../controllers/newsletter.controller.js';

export const adminRouter = Router();

/** All admin routes require valid JWT */
adminRouter.use(verifyToken);

/** ── Data reads ────────────────────────────────────── */
adminRouter.get('/queue',        getQueue);
adminRouter.get('/published',    getPublished);
adminRouter.get('/stats',        getStats);
adminRouter.get('/subscribers',  getSubscribers);

/** ── Single article actions ────────────────────────── */
adminRouter.put('/articles/:id/approve',   approveArticle);
adminRouter.put('/articles/:id/reject',    rejectArticle);
adminRouter.put('/articles/:id/edit',      validateArticleEdit, editArticle);
adminRouter.put('/articles/:id/unpublish', unpublishArticle);
adminRouter.put('/articles/:id/pin',       togglePin);
adminRouter.put('/articles/:id/slot',      updateSlot);
adminRouter.delete('/articles/:id',        deleteArticle);

/** ── Bulk actions ──────────────────────────────────── */
adminRouter.post('/articles/bulk-approve', bulkApprove);
adminRouter.post('/articles/bulk-reject',  bulkReject);

/** ── Automation controls ───────────────────────────── */
adminRouter.post('/generate',          triggerGeneration);
adminRouter.post('/publish',           triggerPublish);
adminRouter.post('/newsletter/send',   sendNewsletter);
adminRouter.post('/test-email',        testEmail);
