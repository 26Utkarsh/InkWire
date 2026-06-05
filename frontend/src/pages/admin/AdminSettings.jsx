/**
 * @fileoverview AdminSettings.jsx — Settings and system control panel.
 * Features: email test, manual publish, system status, schedule info.
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { useAdminStats } from '../../hooks/useAdmin.js';
import { sendTestEmail, triggerGeneration, triggerPublish, sendNewsletter } from '../../services/adminService.js';
import useAppStore from '../../store/useAppStore.js';
import './AdminSettings.css';

const StatusDot = ({ ok }) => (
  <span className={`status-dot ${ok ? 'status-dot--ok' : 'status-dot--err'}`} />
);

const AdminSettings = () => {
  const { stats } = useAdminStats();
  const addToast = useAppStore((s) => s.addToast);
  const [loading, setLoading] = useState({});

  const run = (key, fn, msg, errMsg) => async () => {
    setLoading((p) => ({ ...p, [key]: true }));
    try { await fn(); addToast(msg, 'success'); }
    catch (e) { addToast(errMsg || e.message, 'error'); }
    finally { setLoading((p) => ({ ...p, [key]: false })); }
  };

  const system = stats?.system || {};

  return (
    <AdminLayout>
      <Helmet><title>Settings | InkWire Admin</title></Helmet>

      <div className="admin-page">
        <header className="admin-page-header">
          <h1 className="admin-page-title">Settings & Controls</h1>
        </header>

        {/* ── System Status ── */}
        <section className="settings-section">
          <h2 className="settings-section-title">System Status</h2>
          <div className="status-grid">
            <div className="status-row">
              <StatusDot ok={system.dbConnected} />
              <span className="status-label">MongoDB Database</span>
              <span className={`status-value ${system.dbConnected ? 'status-value--ok' : 'status-value--err'}`}>
                {system.dbConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="status-row">
              <StatusDot ok={system.schedulerRunning} />
              <span className="status-label">Article Scheduler</span>
              <span className={`status-value ${system.schedulerRunning ? 'status-value--ok' : 'status-value--err'}`}>
                {system.schedulerRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div className="status-row">
              <StatusDot ok={system.emailConfigured} />
              <span className="status-label">Email Notifications</span>
              <span className={`status-value ${system.emailConfigured ? 'status-value--ok' : 'status-value--warn'}`}>
                {system.emailConfigured ? 'Configured' : 'Not configured — set EMAIL_USER & EMAIL_PASS in .env'}
              </span>
            </div>
          </div>
        </section>

        {/* ── Email Controls ── */}
        <section className="settings-section">
          <h2 className="settings-section-title">Email Notifications</h2>
          <p className="settings-desc">
            InkWire sends you an email at <strong>5:00 AM</strong> when articles are generated, and 30-minute reminders
            before each publish window. Test your email configuration below.
          </p>
          <button
            className="btn btn-primary"
            onClick={run('testEmail', sendTestEmail, '📧 Test email sent! Check your inbox.', 'Email failed — check EMAIL_USER and EMAIL_PASS in .env')}
            disabled={loading.testEmail}
            id="btn-test-email"
          >
            {loading.testEmail ? '⏳ Sending…' : '📧 Send Test Email'}
          </button>
          {!system.emailConfigured && (
            <div className="settings-warning">
              ⚠️ Email is not configured. Add <code>EMAIL_USER</code>, <code>EMAIL_PASS</code>, and <code>EMAIL_TO</code> to your <code>.env</code> file and restart the backend.
            </div>
          )}
        </section>

        {/* ── Publishing Schedule ── */}
        <section className="settings-section">
          <h2 className="settings-section-title">Publishing Schedule</h2>
          <p className="settings-desc">InkWire runs on a fully automated daily schedule:</p>
          <div className="schedule-grid">
            {[
              { time: '5:00 AM',  label: 'AI Generation',           icon: '🤖', desc: 'Fetches headlines → writes 6 articles → saves as drafts' },
              { time: '7:30 AM',  label: 'Morning Reminder',        icon: '📧', desc: 'Email alert if morning articles are unapproved' },
              { time: '8:00 AM',  label: 'Morning Publish',         icon: '🌅', desc: 'Publishes approved morning slot articles' },
              { time: '12:30 PM', label: 'Afternoon Reminder',      icon: '📧', desc: 'Email alert if afternoon articles are unapproved' },
              { time: '1:00 PM',  label: 'Afternoon Publish',       icon: '☀️', desc: 'Publishes approved afternoon slot articles' },
              { time: '6:30 PM',  label: 'Evening Reminder',        icon: '📧', desc: 'Email alert if evening articles are unapproved' },
              { time: '7:00 PM',  label: 'Evening Publish',         icon: '🌆', desc: 'Publishes approved evening slot articles' },
            ].map((item) => (
              <div key={item.time} className="schedule-row">
                <div className="schedule-time">{item.time}</div>
                <div className="schedule-icon">{item.icon}</div>
                <div>
                  <div className="schedule-label">{item.label}</div>
                  <div className="schedule-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Manual Controls ── */}
        <section className="settings-section">
          <h2 className="settings-section-title">Manual Controls</h2>
          <p className="settings-desc">
            These buttons bypass the schedule and run operations immediately. Use during testing or to catch up on missed runs.
          </p>
          <div className="manual-controls">
            <div className="manual-control-card">
              <h3>⚡ Generate Articles Now</h3>
              <p>Fetches today's headlines and writes 6 new articles. Articles appear in the queue in ~2 minutes.</p>
              <button
                className="btn btn-primary"
                onClick={run('generate', triggerGeneration, '⚡ Generation started! Check queue in ~2 minutes.', 'Generation failed')}
                disabled={loading.generate}
                id="btn-generate-settings"
              >
                {loading.generate ? '⏳ Starting…' : '⚡ Generate Now'}
              </button>
            </div>

            {['morning', 'afternoon', 'evening'].map((slot) => (
              <div key={slot} className="manual-control-card">
                <h3>{slot === 'morning' ? '🌅' : slot === 'afternoon' ? '☀️' : '🌆'} Publish {slot.charAt(0).toUpperCase() + slot.slice(1)} Slot</h3>
                <p>Immediately publishes all approved {slot} articles right now, bypassing the scheduled time.</p>
                <button
                  className="btn btn-secondary"
                  onClick={run(`publish_${slot}`, () => triggerPublish(slot), `${slot} articles published!`, 'Publish failed')}
                  disabled={loading[`publish_${slot}`]}
                  id={`btn-publish-${slot}`}
                >
                  {loading[`publish_${slot}`] ? '⏳ Publishing…' : `Publish ${slot.charAt(0).toUpperCase() + slot.slice(1)} Now`}
                </button>
              </div>
            ))}

            <div className="manual-control-card">
              <h3>📧 Send Newsletter</h3>
              <p>Manually sends the daily digest email to all active newsletter subscribers.</p>
              <button
                className="btn btn-secondary"
                onClick={run('newsletter', sendNewsletter, '📧 Newsletter sent!', 'Newsletter failed')}
                disabled={loading.newsletter}
                id="btn-newsletter-settings"
              >
                {loading.newsletter ? '⏳ Sending…' : '📧 Send Newsletter'}
              </button>
            </div>
          </div>
        </section>

        {/* ── App Info ── */}
        <section className="settings-section">
          <h2 className="settings-section-title">App Information</h2>
          <div className="info-grid">
            <div className="info-row"><span>App</span><strong>InkWire v1.0</strong></div>
            <div className="info-row"><span>AI Model</span><strong>Gemini Flash (Groq fallback)</strong></div>
            <div className="info-row"><span>News Sources</span><strong>NewsAPI + GNews</strong></div>
            <div className="info-row"><span>Images</span><strong>Unsplash API</strong></div>
            <div className="info-row"><span>Database</span><strong>MongoDB Atlas</strong></div>
            <div className="info-row"><span>Admin Email</span><strong>{import.meta.env.VITE_ADMIN_EMAIL || 'Set in .env'}</strong></div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
