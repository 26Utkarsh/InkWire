/**
 * @fileoverview AdminLayout.jsx — Admin shell with mobile-responsive sidebar drawer.
 * FIXES: Mobile sidebar now slides in as drawer overlay, not hidden.
 * NEW: Pending count badge on Queue nav item, bottom tab bar on mobile.
 */

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, Navigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore.js';
import { useAdminStats } from '../../hooks/useAdmin.js';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { isAuthenticated, logout } = useAppStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { stats } = useAdminStats();

  const pendingCount = stats?.today?.pending ?? 0;

  /** Close sidebar on route change */
  useEffect(() => { setSidebarOpen(false); }, []);

  /** Lock body scroll when sidebar is open on mobile */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const NAV_ITEMS = [
    { to: '/admin/dashboard', label: 'Dashboard',  icon: '📊', mobileIcon: '◼' },
    { to: '/admin/queue',     label: 'Queue',       icon: '📋', mobileIcon: '≡', badge: pendingCount },
    { to: '/admin/published', label: 'Published',   icon: '📰', mobileIcon: '●' },
    { to: '/admin/settings',  label: 'Settings',    icon: '⚙️', mobileIcon: '⚙' },
  ];

  return (
    <div className="admin-layout">

      {/* ── Mobile header bar ── */}
      <div className="admin-mobile-header">
        <button
          className="admin-mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          id="admin-mobile-menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="3" y1="6"  x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Link to="/admin/dashboard" className="admin-mobile-logo">InkWire</Link>
        <Link to="/" target="_blank" rel="noopener noreferrer" className="admin-mobile-site-link" aria-label="View site">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </Link>
      </div>

      {/* ── Sidebar overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`} aria-label="Admin navigation">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo" target="_blank" rel="noopener noreferrer">InkWire</Link>
          <span className="admin-badge">Admin</span>
          <button
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            id="admin-sidebar-close"
          >
            ✕
          </button>
        </div>

        <nav className="admin-nav" aria-label="Admin sections">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="admin-nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
              {item.badge > 0 && (
                <span className="admin-nav-badge" aria-label={`${item.badge} pending`}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-view-site-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View live site
          </a>
          <button className="admin-logout-btn" onClick={handleLogout} id="admin-logout-btn">
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="admin-main">
        {children}
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="admin-bottom-bar" aria-label="Quick navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `admin-bottom-tab ${isActive ? 'admin-bottom-tab--active' : ''}`}
          >
            <span className="admin-bottom-icon" aria-hidden="true">{item.icon}</span>
            <span className="admin-bottom-label">{item.label}</span>
            {item.badge > 0 && <span className="admin-bottom-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminLayout;
