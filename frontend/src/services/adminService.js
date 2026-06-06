/**
 * @fileoverview adminService.js — All admin API calls for InkWire frontend.
 * NEW: bulk approve/reject, pin toggle, slot update, test email, trigger publish.
 */

import { api } from '../config/api.js';

/** ── Data reads ──────────────────────────────────────────── */
export const getQueue       = async ()       => (await api.get('/admin/queue')).data;
export const getPublished   = async (page=1) => (await api.get('/admin/published', { params: { page } })).data;
export const getStats       = async ()       => (await api.get('/admin/stats')).data;
export const getSubscribers = async ()       => (await api.get('/admin/subscribers')).data;

/** ── Single article actions ──────────────────────────────── */
export const approveArticle   = async (id)      => (await api.put(`/admin/articles/${id}/approve`)).data;
export const rejectArticle    = async (id)      => (await api.put(`/admin/articles/${id}/reject`)).data;
export const editArticle      = async (id, data)=> (await api.put(`/admin/articles/${id}/edit`, data)).data;
export const unpublishArticle = async (id)      => (await api.put(`/admin/articles/${id}/unpublish`)).data;
export const deleteArticle    = async (id)      => (await api.delete(`/admin/articles/${id}`)).data;
export const togglePin        = async (id)      => (await api.put(`/admin/articles/${id}/pin`)).data;
export const updateSlot       = async (id, slot)=> (await api.put(`/admin/articles/${id}/slot`, { slot })).data;

/** ── Bulk actions ────────────────────────────────────────── */
export const bulkApprove = async (ids) => (await api.post('/admin/articles/bulk-approve', { ids })).data;
export const bulkReject  = async (ids) => (await api.post('/admin/articles/bulk-reject',  { ids })).data;

/** ── Automation controls ─────────────────────────────────── */
export const triggerGeneration = async ()     => (await api.post('/admin/generate')).data;
export const triggerPublish    = async (slot) => (await api.post('/admin/publish', { slot })).data;
export const sendNewsletter    = async ()     => (await api.post('/admin/newsletter/send')).data;
export const sendTestEmail     = async ()     => (await api.post('/admin/test-email')).data;
export const generateCustomArticle = async (data) => (await api.post('/admin/generate-custom', data)).data;
