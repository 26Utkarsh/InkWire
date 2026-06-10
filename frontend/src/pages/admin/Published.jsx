/**
 * @fileoverview Published.jsx — All published articles view for InkWire admin.
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { format } from 'date-fns';
import { getPublished, unpublishArticle, deleteArticle, togglePin } from '../../services/adminService.js';
import useAppStore from '../../store/useAppStore.js';
import Badge from '../../components/ui/Badge.jsx';
import './Published.css';

const Published = () => {
  const [articles, setArticles] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const addToast = useAppStore((s) => s.addToast);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getPublished();
      setArticles(data.data || []);
    } catch {
      addToast('Failed to load articles', 'error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const handleUnpublish = async (id, headline) => {
    try {
      await unpublishArticle(id);
      addToast(`Unpublished: "${headline}"`, 'info');
      load();
    } catch {
      addToast('Failed to unpublish', 'error');
    }
  };

  const handleDelete = async (id, headline) => {
    if (!window.confirm(`Delete "${headline}"? This cannot be undone.`)) return;
    try {
      await deleteArticle(id);
      addToast('Article deleted', 'success');
      load();
    } catch {
      addToast('Failed to delete', 'error');
    }
  };

  const handlePin = async (id, headline) => {
    try {
      const res = await togglePin(id);
      addToast(res.isFeatured ? `📌 "${headline}" pinned as featured hero` : `❌ "${headline}" unpinned`, 'success');
      load();
    } catch {
      addToast('Failed to toggle pin state', 'error');
    }
  };

  return (
    <AdminLayout>
      <Helmet><title>Published | InkWire Admin</title></Helmet>

      <div className="admin-page">
        <header className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Published Articles</h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {articles.length} published
            </p>
          </div>
          <button className="btn btn-ghost" onClick={load} id="btn-refresh-published">↻ Refresh</button>
        </header>

        {loading ? (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '40px 0', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
            <div className="spinner" /> Loading...
          </div>
        ) : (
          <div className="published-table-wrap">
            <table className="published-table">
              <thead>
                <tr>
                  <th>Headline</th>
                  <th>Topic</th>
                  <th>Published</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a._id} className={a.isFeatured ? 'table-row-featured' : ''}>
                    <td className="published-headline">
                      {a.isFeatured && <span style={{ marginRight: '6px', cursor: 'help' }} title="Pinned at the top of homepage">📌</span>}
                      <a href={`/article/${a.slug}`} target="_blank" rel="noopener noreferrer">{a.headline}</a>
                    </td>
                    <td><Badge topic={a.topic} /></td>
                    <td className="published-date">{a.publishedAt ? format(new Date(a.publishedAt), 'MMM d, yyyy HH:mm') : '—'}</td>
                    <td className="published-views">{a.views?.toLocaleString()}</td>
                    <td className="published-actions">
                      <button
                        className={`btn btn-sm ${a.isFeatured ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => handlePin(a._id, a.headline)}
                        id={`pin-${a._id}`}
                        style={a.isFeatured ? { background: '#2563eb', color: '#fff', borderColor: '#2563eb', fontWeight: 600 } : {}}
                      >
                        {a.isFeatured ? '📍 Pinned' : '📌 Pin Hero'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleUnpublish(a._id, a.headline)} id={`unpublish-${a._id}`}>Unpublish</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id, a.headline)} id={`delete-${a._id}`}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {articles.length === 0 && (
              <p style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
                No published articles yet.
              </p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Published;
