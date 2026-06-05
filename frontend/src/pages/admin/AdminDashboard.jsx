/**
 * @fileoverview AdminDashboard.jsx — Stats overview for InkWire admin.
 */

import React, { useState, useEffect } from 'react';
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
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

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
        <header className="admin-page-hero">
          <div className="hero-welcome">
            <h1 className="admin-page-title">Editorial Control Room</h1>
            <p className="admin-page-subtitle">Welcome back. Here is the publication overview and scheduler status for today.</p>
          </div>
          
          <div className="live-widgets">
            <div className="live-clock-widget">
              <span className="live-pulse"></span>
              <span className="clock-time">{formattedTime}</span>
              <span className="clock-tz">IST</span>
            </div>
            <div className="admin-header-actions">
              <button className="btn btn-primary" onClick={handleGenerate} id="btn-generate-now">
                ⚡ Generate Now
              </button>
              <button className="btn btn-secondary" onClick={handleNewsletter} id="btn-send-newsletter">
                📧 Send Newsletter
              </button>
            </div>
          </div>
        </header>

        {/* Today's stats */}
        <section className="dashboard-section animate-fade-in">
          <h2 className="dashboard-section-title">Today</h2>
          <div className="stats-grid">
            <StatCard icon="✅" label="Articles approved" value={loading ? '…' : stats?.today?.approved} />
            <StatCard icon="❌" label="Articles rejected" value={loading ? '…' : stats?.today?.rejected} />
            <StatCard icon="⏳" label="Awaiting review" value={loading ? '…' : stats?.today?.pending} />
            <StatCard icon="👁️" label="Total views today" value={loading ? '…' : stats?.today?.views?.toLocaleString()} />
          </div>
        </section>

        {/* Weekly stats */}
        <section className="dashboard-section animate-fade-in delay-1">
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

        {/* Quick actions portal */}
        <section className="dashboard-section animate-fade-in delay-2">
          <h2 className="dashboard-section-title">Quick Actions Portal</h2>
          <div className="quick-actions-grid">
            <a href="/admin/queue" className="quick-action-card">
              <div className="action-card-icon">📋</div>
              <div className="action-card-content">
                <h3>Review Queue</h3>
                <p>Approve or reject AI drafts.</p>
                {stats?.today?.pending > 0 && (
                  <span className="action-badge pending-badge">{stats.today.pending} pending</span>
                )}
              </div>
              <div className="action-card-arrow">→</div>
            </a>
            <a href="/admin/published" className="quick-action-card">
              <div className="action-card-icon">📰</div>
              <div className="action-card-content">
                <h3>Published Articles</h3>
                <p>Manage live content and feature stories.</p>
              </div>
              <div className="action-card-arrow">→</div>
            </a>
            <a href="/" target="_blank" rel="noopener noreferrer" className="quick-action-card">
              <div className="action-card-icon">🌐</div>
              <div className="action-card-content">
                <h3>Visit Live Site</h3>
                <p>Open the public portal in a new tab.</p>
              </div>
              <div className="action-card-arrow">→</div>
            </a>
          </div>
        </section>

        {/* Manual Publishing Overrides (Premium Control Center) */}
        <section className="dashboard-section control-center-panel animate-fade-in delay-3">
          <h2 className="dashboard-section-title control-center-title">🚀 Manual Publishing Console</h2>
          <p className="control-center-desc">
            Normally, articles approved in the queue will publish automatically at their scheduled times (8 AM, 1 PM, or 7 PM IST). Use these buttons to force-publish all approved articles in a specific slot instantly:
          </p>
          <div className="control-center-actions">
            <button className="btn btn-publish" onClick={() => handlePublishSlot('morning')} id="btn-publish-morning">🌅 Publish Morning</button>
            <button className="btn btn-publish" onClick={() => handlePublishSlot('afternoon')} id="btn-publish-afternoon">☀️ Publish Afternoon</button>
            <button className="btn btn-publish" onClick={() => handlePublishSlot('evening')} id="btn-publish-evening">🌆 Publish Evening</button>
          </div>
          <div className="system-health-divider"></div>
          <div className="system-health-grid">
            <div className="health-item">
              <span className="status-dot online-pulse"></span>
              <span className="health-label">AI Writer Model:</span>
              <span className="health-val">Gemini 2.5 Flash</span>
            </div>
            <div className="health-item">
              <span className="status-dot online-pulse"></span>
              <span className="health-label">Database Sync:</span>
              <span className="health-val">MongoDB Atlas</span>
            </div>
            <div className="health-item">
              <span className="status-dot online-pulse"></span>
              <span className="health-label">Newsletter Dispatcher:</span>
              <span className="health-val">Nodemailer Active</span>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
