/**
 * @fileoverview ArticleEditor.jsx — Rich text editor for admin article editing.
 * Uses react-quill for full editorial control before approval.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { editArticle } from '../../services/adminService.js';
import { api } from '../../config/api.js';
import useAppStore from '../../store/useAppStore.js';
import './ArticleEditor.css';

/** Quill toolbar configuration */
const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    ['blockquote', 'link'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'],
  ],
};

const QUILL_FORMATS = ['header', 'bold', 'italic', 'underline', 'blockquote', 'link', 'list', 'bullet'];

const ArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useAppStore((s) => s.addToast);

  const [article, setArticle] = useState(null);
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const wordCount = body.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/admin/queue`);
        const found = res.data.data.find((a) => a._id === id);
        if (found) {
          setArticle(found);
          setHeadline(found.headline || '');
          setSubheadline(found.subheadline || '');
          setBody(found.body || '');
          setTags((found.tags || []).join(', '));
        }
      } catch {
        addToast('Failed to load article', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSave = async (approve = false) => {
    try {
      setSaving(true);
      await editArticle(id, {
        headline: headline.trim(),
        subheadline: subheadline.trim(),
        body,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        approve,
      });
      addToast(approve ? 'Article edited and approved!' : 'Article saved as draft', 'success');
      navigate('/admin/queue');
    } catch (err) {
      addToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page editor-loading">
          <div className="spinner" /> Loading editor...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet><title>Edit Article | InkWire Admin</title></Helmet>

      <div className="admin-page editor-page">
        <header className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Edit Article</h1>
            <p className="editor-word-count">{wordCount.toLocaleString()} words</p>
          </div>
          <div className="admin-header-actions">
            <button className="btn btn-secondary" onClick={() => handleSave(false)} disabled={saving} id="btn-save-draft">
              Save Draft
            </button>
            <button className="btn btn-success" onClick={() => handleSave(true)} disabled={saving} id="btn-save-approve">
              {saving ? 'Saving...' : '✅ Save & Approve'}
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/admin/queue')} disabled={saving}>
              Cancel
            </button>
          </div>
        </header>

        <div className="editor-fields">
          <div className="editor-field">
            <label className="editor-label" htmlFor="editor-headline">Headline</label>
            <input
              id="editor-headline"
              className="input editor-headline-input"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Article headline"
            />
          </div>

          <div className="editor-field">
            <label className="editor-label" htmlFor="editor-subheadline">Subheadline</label>
            <input
              id="editor-subheadline"
              className="input"
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              placeholder="Subheadline"
            />
          </div>

          <div className="editor-field editor-body-field">
            <label className="editor-label">Article Body</label>
            <ReactQuill
              theme="snow"
              value={body}
              onChange={setBody}
              modules={QUILL_MODULES}
              formats={QUILL_FORMATS}
              className="editor-quill"
            />
          </div>

          <div className="editor-field">
            <label className="editor-label" htmlFor="editor-tags">Tags (comma-separated)</label>
            <input
              id="editor-tags"
              className="input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="India, Technology, AI, ..."
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ArticleEditor;
