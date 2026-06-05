/**
 * @fileoverview AdminDashboard.jsx — Stats overview for InkWire admin.
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAdminStats } from '../../hooks/useAdmin.js';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { triggerGeneration, sendNewsletter, triggerPublish } from '../../services/adminService.js';
import useAppStore from '../../store/useAppStore.js';
import './AdminDashboard.css';

/** Stat card subcomponent */
const StatCard = ({ icon, label, value, sublabel }) => (
  <div className="stat-card">
    <span className="stat-icon">{icon}</span>
    <div className="stat-body">
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {sublabel && <div className="stat-sublabel">{sublabel}</div>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const { stats, loading } = useAdminStats();
  const addToast = useAppStore((s) => s.addToast);

  const handleGenerate = async () => {
    try {
      await triggerGeneration();
      addToast('Generation started! Articles will appear in queue in ~2 minutes.', 'success');
    } catch {
      addToast('Failed to trigger generation', 'error');
    }
  };

  const handleNewsletter = async () => {
    try {
      await sendNewsletter();
      addToast('Newsletter sending in background.', 'success');
    } catch {
      addToast('Failed to send newsletter', 'error');
    }
  };

  const handlePublishSlot = async (slot) => {
    try {
      await triggerPublish(slot);
      addToast(`🚀 Publishing triggered for ${slot} slot!`, 'success');
    } catch {
      addToast(`Failed to publish ${slot} slot`, 'error');
    }
  };

  return (
    <AdminLayout>
      <Helmet><title>Dashboard | InkWire Admin</title></Helmet>

      <div className="admin-page">
        <header className="admin-page-header">
          <h1 className="admin-page-title">Dashboard</h1>
          <div className="admin-header-actions">
            <button className="btn btn-primary" onClick={handleGenerate} id="btn-generate-now">
              ⚡ Generate Now
            </button>
            <button className="btn btn-secondary" onClick={handleNewsletter} id="btn-send-newsletter">
              📧 Send Newsletter
            </button>
          </div>
        </header>

        {/* Today's stats */}
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Today</h2>
          <div className="stats-grid">
            <StatCard icon="✅" label="Articles approved" value={loading ? '…' : stats?.today?.approved} />
            <StatCard icon="❌" label="Articles rejected" value={loading ? '…' : stats?.today?.rejected} />
            <StatCard icon="⏳" label="Awaiting review" value={loading ? '…' : stats?.today?.pending} />
            <StatCard icon="👁️" label="Total views today" value={loading ? '…' : stats?.today?.views?.toLocaleString()} />
          </div>
        </section>

        {/* Weekly stats */}
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">This Week</h2>
          <div className="stats-grid">
            <StatCard icon="📰" label="Articles published" value={loading ? '…' : stats?.week?.published} />
            <StatCard icon="📧" label="Newsletter subscribers" value={loading ? '…' : stats?.subscribers?.toLocaleString()} sublabel="Active subscribers" />
            {stats?.topArticle && (
              <StatCard
                icon="🏆"
                label="Top article"
                value={`${stats.topArticle.views?.toLocaleString()} views`}
                sublabel={stats.topArticle.headline}
              />
            )}
          </div>
        </section>

        {/* Quick links */}
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Quick Actions</h2>
          <div className="quick-actions">
            <a href="/admin/queue" className="btn btn-secondary quick-action-btn">📋 Review Queue</a>
            <a href="/admin/published" className="btn btn-secondary quick-action-btn">📰 Published Articles</a>
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost quick-action-btn">🌐 View Site →</a>
          </div>
        </section>

        {/* Manual Publishing Overrides */}
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Manual Publishing</h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Normally, articles approved in the queue will publish automatically at their scheduled times (8 AM, 1 PM, or 7 PM IST). Use these buttons to force-publish all approved articles in a specific slot instantly:
          </p>
          <div className="quick-actions" style={{ gap: '10px', display: 'flex', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => handlePublishSlot('morning')} id="btn-publish-morning">🌅 Publish Morning</button>
            <button className="btn btn-secondary" onClick={() => handlePublishSlot('afternoon')} id="btn-publish-afternoon">☀️ Publish Afternoon</button>
            <button className="btn btn-secondary" onClick={() => handlePublishSlot('evening')} id="btn-publish-evening">🌆 Publish Evening</button>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
