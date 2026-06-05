/**
 * @fileoverview Navbar.jsx — Top navigation bar for InkWire.
 * FIXES:
 *   - Search replaced with full glassmorphic modal overlay (no layout shift)
 *   - 🔍 icon hidden when modal is open (no duplication)
 *   - Right-side actions aligned with consistent padding, no edge flush
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { TOPICS } from '../../constants/index.js';
import useAppStore from '../../store/useAppStore.js';
import './Navbar.css';

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useAppStore();
  const navigate = useNavigate();

  /** Close modal on Escape key */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setSearchOpen(false);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      setSearchQuery('');
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [searchOpen, handleKeyDown]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      closeMobileMenu();
    }
  };

  return (
    <>
      <header className="navbar" role="banner">
        <div className="navbar-inner container">

          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu} aria-label="InkWire — Home">
            <span className="navbar-logo-text">InkWire</span>
          </Link>

          {/* Desktop topic navigation */}
          <nav className="navbar-links" aria-label="Topic navigation">
            {TOPICS.map((topic) => (
              <NavLink
                key={topic.id}
                to={`/topic/${topic.id}`}
                className={({ isActive }) => `navbar-link ${isActive ? 'navbar-link--active' : ''}`}
                style={{ '--topic-color': topic.color }}
              >
                {topic.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions: search icon hidden when modal is open */}
          <div className="navbar-actions">
            {!searchOpen && (
              <button
                className="navbar-icon-btn"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                id="navbar-search-toggle"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            )}
            <button
              className={`navbar-icon-btn navbar-hamburger ${mobileMenuOpen ? 'navbar-hamburger--open' : ''}`}
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              id="navbar-hamburger"
            >
              {mobileMenuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="navbar-mobile-menu" aria-label="Mobile navigation">
            <nav className="navbar-mobile-nav">
              {TOPICS.map((topic) => (
                <NavLink
                  key={topic.id}
                  to={`/topic/${topic.id}`}
                  className="navbar-mobile-link"
                  onClick={closeMobileMenu}
                >
                  <span className="navbar-mobile-dot" style={{ background: topic.color }} />
                  {topic.label}
                </NavLink>
              ))}
            </nav>
            <form className="navbar-mobile-search" onSubmit={handleSearch}>
              <input
                className="input"
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search articles"
              />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Glassmorphic search modal — full-screen overlay, no layout shift */}
      {searchOpen && (
        <div
          className="search-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
        >
          <div className="search-modal">
            <div className="search-modal-header">
              <svg className="search-modal-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <form className="search-modal-form" onSubmit={handleSearch} role="search">
                <input
                  id="search-modal-input"
                  className="search-modal-input"
                  type="search"
                  placeholder="Search articles, topics, keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  autoComplete="off"
                  aria-label="Search InkWire"
                />
              </form>
              <button
                className="search-modal-close"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                id="search-modal-close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="search-modal-hint">
              Press <kbd>Enter</kbd> to search · <kbd>Esc</kbd> to close
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
