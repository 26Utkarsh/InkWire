/**
 * @fileoverview Navbar.jsx — Top navigation bar for InkWire.
 * Premium two-row editorial layout inspired by The New York Times and The Hindu.
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
  const bookmarks = useAppStore((s) => s.bookmarks);
  const savedCount = bookmarks.length;
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

  // Format today's date in classic newspaper header style
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <>
      <header className="navbar" role="banner">
        {/* Row 1: Top branding bar */}
        {/* Row 1: Top branding bar */}
        <div className="navbar-top container">
          {/* Left info box: Hamburger menu button + label (visible on desktop) */}
          <div className="navbar-top-left">
            <button
              className={`navbar-hamburger-bbc ${mobileMenuOpen ? 'navbar-hamburger-bbc--open' : ''}`}
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              id="navbar-hamburger-bbc"
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
              <span className="hamburger-label">Menu</span>
            </button>
          </div>

          {/* Logo (Centered on desktop, styled like BBC with restored Elephant Crest) */}
          <Link to="/" className="navbar-logo-bbc" onClick={closeMobileMenu} aria-label="InkWire — Home">
            <div className="logo-blocks-bbc">
              <span className="logo-block-bbc">I</span>
              <span className="logo-block-bbc">N</span>
              <span className="logo-block-bbc">K</span>
            </div>
            <img src="/crest.svg" className="logo-crest-bbc" alt="InkWire Elephant Crest" aria-hidden="true" />
            <span className="logo-text-bbc">WIRE</span>
          </Link>

          {/* Right actions (Register / Sign In + Search) */}
          <div className="navbar-top-right">
            {!searchOpen && (
              <button
                className="navbar-search-btn-bbc"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                id="navbar-search-toggle"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="search-text-bbc">Search</span>
              </button>
            )}

            {/* Mobile-only menu toggle (matches desktop but smaller) */}
            <button
              className={`navbar-hamburger-bbc mobile-only-toggle ${mobileMenuOpen ? 'navbar-hamburger-bbc--open' : ''}`}
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              id="navbar-hamburger-mobile"
            >
              {mobileMenuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Navigation Links (desktop only, centered list) */}
        <div className="navbar-bottom">
          <div className="navbar-bottom-inner container">
            <nav className="navbar-links" aria-label="Topic navigation">
              <NavLink
                to="/"
                className={({ isActive }) => `navbar-link ${isActive ? 'navbar-link--active' : ''}`}
                style={{ '--topic-color': '#c00000' }}
              >
                Home
              </NavLink>
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
              <NavLink
                to="/saved"
                className={({ isActive }) => `navbar-link navbar-link--saved ${isActive ? 'navbar-link--active' : ''}`}
                style={{ '--topic-color': '#b00808' }}
                aria-label={`Saved articles${savedCount > 0 ? ` — ${savedCount} saved` : ''}`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill={savedCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="navbar-bookmark-icon">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Saved
                {savedCount > 0 && (
                  <span className="navbar-saved-badge" aria-hidden="true">{savedCount}</span>
                )}
              </NavLink>
            </nav>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="navbar-mobile-menu" aria-label="Mobile navigation">
            <nav className="navbar-mobile-nav">
              <NavLink
                to="/"
                className="navbar-mobile-link"
                onClick={closeMobileMenu}
              >
                <span className="navbar-mobile-dot" style={{ background: '#c00000' }} />
                Home
              </NavLink>
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
              <NavLink
                to="/saved"
                className="navbar-mobile-link navbar-mobile-link--saved"
                onClick={closeMobileMenu}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={savedCount > 0 ? '#b00808' : 'none'} stroke={savedCount > 0 ? '#b00808' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Saved Articles
                {savedCount > 0 && (
                  <span className="navbar-mobile-saved-badge">{savedCount}</span>
                )}
              </NavLink>
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

      {/* Glassmorphic search modal — full-screen overlay */}
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
