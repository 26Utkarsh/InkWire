/**
 * @fileoverview ArticleQueue.jsx — Admin review queue with full controls.
 * NEW: Bulk select, bulk approve/reject, slot override, pin toggle, progress indicators.
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { useQueue } from '../../hooks/useAdmin.js';
import { approveArticle, rejectArticle, bulkApprove, bulkReject, updateSlot, togglePin } from '../../services/adminService.js';
import useAppStore from '../../store/useAppStore.js';
import Badge from '../../components/ui/Badge.jsx';
import './ArticleQueue.css';

const SLOT_ICONS  = { morning: '🌅', afternoon: '☀️', evening: '🌆' };
const SLOT_TIMES  = { morning: '8 AM', afternoon: '1 PM', evening: '7 PM' };
const SLOT_LABELS = ['morning', 'afternoon', 'evening'];

/** Single draft article card */
const DraftCard = ({ article, selected, onSelect, onAction }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(article.scheduledFor);
  const addToast = useAppStore((s) => s.addToast);

  const act = (fn, msg, errMsg) => async () => {
    setLoading(true);
    try { await fn(); addToast(msg, 'success'); onAction(); }
    catch { addToast(errMsg, 'error'); }
    finally { setLoading(false); }
  };

  const handleApprove = act(
    () => approveArticle(article._id),
    `🚀 "${article.headline.slice(0, 40)}…" published instantly`,
    'Failed to publish'
  );

  const handleReject = act(
    () => rejectArticle(article._id),
    'Article rejected',
    'Failed to reject'
  );

  const handlePin = act(
    () => togglePin(article._id),
    article.isFeatured ? 'Unpinned from hero' : '📌 Pinned as featured hero',
    'Failed to toggle pin'
  );

  const handleSlotChange = async (slot) => {
    setCurrentSlot(slot);
    try {
      await updateSlot(article._id, slot);
      addToast(`Slot changed to ${slot}`, 'success');
    } catch {
      addToast('Failed to change slot', 'error');
      setCurrentSlot(article.scheduledFor);
    }
  };

  return (
    <div className={`draft-card ${selected ? 'draft-card--selected' : ''} ${loading ? 'draft-card--loading' : ''}`}>
      {/* Selection checkbox + meta row */}
      <div className="draft-card-top">
        <label className="draft-checkbox-label">
          <input
            type="checkbox"
            className="draft-checkbox"
            checked={selected}
            onChange={() => onSelect(article._id)}
            aria-label={`Select "${article.headline}"`}
          />
        </label>

        <div className="draft-card-meta">
          <Badge topic={article.topic} />

          {/* Slot override dropdown */}
          <select
            className="draft-slot-select"
            value={currentSlot}
            onChange={(e) => handleSlotChange(e.target.value)}
            aria-label="Change publish slot"
          >
            {SLOT_LABELS.map((s) => (
              <option key={s} value={s}>
                {SLOT_ICONS[s]} {s.charAt(0).toUpperCase() + s.slice(1)} ({SLOT_TIMES[s]})
              </option>
            ))}
          </select>

          <span className="draft-meta-text">
            {article.wordCount} words · {article.readTime} min read
          </span>

          {article.isFeatured && (
            <span className="draft-featured-pill">📌 Featured</span>
          )}
        </div>
      </div>

      {/* Headline + summary */}
      <h3 className="draft-headline">{article.headline}</h3>
      {article.subheadline && <p className="draft-subheadline">{article.subheadline}</p>}
      {article.summary && <p className="draft-summary">{article.summary}</p>}

      {/* Action row */}
      <div className="draft-actions-row">
        <div className="draft-primary-actions">
          <button
            className="btn btn-success"
            onClick={handleApprove}
            disabled={loading}
            id={`approve-${article._id}`}
          >
            🚀 Publish
          </button>
          <a
            href={`/admin/editor/${article._id}`}
            className="btn btn-secondary"
            id={`edit-${article._id}`}
          >
            ✏️ Edit
          </a>
          <button
            className="btn btn-danger"
            onClick={handleReject}
            disabled={loading}
            id={`reject-${article._id}`}
          >
            ✕ Reject
          </button>
        </div>
        <div className="draft-secondary-actions">
          <button
            className={`btn btn-ghost draft-pin-btn ${article.isFeatured ? 'draft-pin-btn--active' : ''}`}
            onClick={handlePin}
            disabled={loading}
            title={article.isFeatured ? 'Unpin from hero' : 'Pin as featured hero'}
            id={`pin-${article._id}`}
          >
            {article.isFeatured ? '📌 Unpin' : '📌 Pin Hero'}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            id={`expand-${article._id}`}
          >
            {expanded ? '▲ Hide' : '▼ Preview'}
          </button>
        </div>
      </div>

      {/* Expandable full body */}
      {expanded && (
        <div className="draft-preview">
          {article.imageUrl && (
            <img src={article.imageUrl} alt="" className="draft-preview-image" loading="lazy" />
          )}
          <div
            className="draft-body article-body"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
          {article.sources?.length > 0 && (
            <div className="draft-sources">
              <strong>Sources:</strong> {article.sources.map((s) => s.source || s.title).join(' · ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ArticleQueue = () => {
  const { drafts, loading, reload } = useQueue();
  const [selected, setSelected] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const addToast = useAppStore((s) => s.addToast);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(selected.size === drafts.length ? new Set() : new Set(drafts.map((d) => d._id)));
  };

  const handleBulkApprove = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      const result = await bulkApprove([...selected]);
      addToast(`🚀 ${result.count} articles published instantly`, 'success');
      setSelected(new Set());
      reload();
    } catch {
      addToast('Bulk approve failed', 'error');
    } finally { setBulkLoading(false); }
  };

  const handleBulkReject = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Reject ${selected.size} article${selected.size !== 1 ? 's' : ''}?`)) return;
    setBulkLoading(true);
    try {
      const result = await bulkReject([...selected]);
      addToast(`${result.count} articles rejected`, 'info');
      setSelected(new Set());
      reload();
    } catch {
      addToast('Bulk reject failed', 'error');
    } finally { setBulkLoading(false); }
  };

  return (
    <AdminLayout>
      <Helmet><title>Article Queue | InkWire Admin</title></Helmet>

      <div className="admin-page">
        <header className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Article Queue</h1>
            <p className="queue-subtitle">
              {loading ? 'Loading…' : `${drafts.length} article${drafts.length !== 1 ? 's' : ''} awaiting review`}
            </p>
          </div>
          <div className="admin-header-actions">
            <button className="btn btn-ghost" onClick={reload} id="btn-refresh-queue">
              ↻ Refresh
            </button>
          </div>
        </header>

        {/* Bulk action toolbar — shown only when items are selected */}
        {selected.size > 0 && (
          <div className="bulk-toolbar">
            <span className="bulk-count">{selected.size} selected</span>
            <button className="btn btn-success" onClick={handleBulkApprove} disabled={bulkLoading}>
              🚀 Publish All Selected
            </button>
            <button className="btn btn-danger" onClick={handleBulkReject} disabled={bulkLoading}>
              ✕ Reject All Selected
            </button>
            <button className="btn btn-ghost" onClick={() => setSelected(new Set())}>
              Clear
            </button>
          </div>
        )}

        {/* Select all row */}
        {!loading && drafts.length > 0 && (
          <div className="queue-select-all">
            <label className="draft-checkbox-label">
              <input
                type="checkbox"
                className="draft-checkbox"
                checked={selected.size === drafts.length && drafts.length > 0}
                onChange={selectAll}
                aria-label="Select all articles"
              />
              <span>{selected.size === drafts.length ? 'Deselect all' : 'Select all'}</span>
            </label>
          </div>
        )}

        {/* Queue content */}
        {loading ? (
          <div className="queue-loading">
            <div className="spinner" />
            <span>Loading queue…</span>
          </div>
        ) : drafts.length === 0 ? (
          <div className="queue-empty">
            <div className="queue-empty-icon">🎉</div>
            <h3>All caught up!</h3>
            <p>No articles awaiting review. New drafts arrive at 5:00 AM daily.</p>
          </div>
        ) : (
          <div className="queue-list">
            {drafts.map((article) => (
              <DraftCard
                key={article._id}
                article={article}
                selected={selected.has(article._id)}
                onSelect={toggleSelect}
                onAction={reload}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ArticleQueue;
