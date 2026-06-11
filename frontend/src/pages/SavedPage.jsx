/**
 * @fileoverview SavedPage.jsx — Saved/bookmarked articles page for InkWire.
 * Reads articles from localStorage via Zustand; no server calls needed.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { formatDistanceToNow } from 'date-fns';
import useAppStore from '../store/useAppStore.js';
import BookmarkButton from '../components/ui/BookmarkButton.jsx';
import './SavedPage.css';

/** Individual saved article row */
const SavedArticleRow = ({ article }) => {
  const savedAgo = article.savedAt
    ? formatDistanceToNow(new Date(article.savedAt), { addSuffix: true })
    : '';

  return (
    <article className="saved-article-row">
      {article.imageUrl && (
        <Link to={`/article/${article.slug}`} className="saved-article-thumb-link" tabIndex="-1" aria-hidden="true">
          <div className="saved-article-thumb">
            <img
              src={article.imageUrl}
              alt={article.headline}
              className="saved-article-thumb-img"
              loading="lazy"
            />
          </div>
        </Link>
      )}

      <div className="saved-article-content">
        {article.topic && (
          <Link
            to={`/topic/${article.topic}`}
            className="saved-article-topic"
          >
            {article.topic.charAt(0).toUpperCase() + article.topic.slice(1)}
          </Link>
        )}
        <h2 className="saved-article-headline">
          <Link to={`/article/${article.slug}`} className="link-article">
            {article.headline}
          </Link>
        </h2>
        {article.summary && (
          <p className="saved-article-summary">{article.summary}</p>
        )}
        <div className="saved-article-footer">
          {savedAgo && (
            <span className="saved-article-time">Saved {savedAgo}</span>
          )}
          <BookmarkButton article={article} variant="pill" className="saved-remove-btn" />
        </div>
      </div>
    </article>
  );
};

const SavedPage = () => {
  const bookmarks = useAppStore((s) => s.bookmarks);
  const clearBookmarks = useAppStore((s) => s.clearBookmarks);

  return (
    <>
      <Helmet>
        <title>Saved Articles | InkWire</title>
        <meta name="description" content="Your saved InkWire articles — read them anytime, offline or online." />
      </Helmet>

      <div className="page-wrapper">
        <div className="container saved-page">
          {/* ── Header ── */}
          <header className="saved-header">
            <div className="saved-header-text">
              <h1 className="saved-title">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" aria-hidden="true" className="saved-title-icon">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Saved Articles
              </h1>
              <p className="saved-subtitle">
                {bookmarks.length === 0
                  ? 'Your reading list is empty'
                  : `${bookmarks.length} article${bookmarks.length !== 1 ? 's' : ''} saved`}
              </p>
            </div>

            {bookmarks.length > 0 && (
              <button
                className="saved-clear-btn"
                onClick={() => {
                  if (window.confirm('Remove all saved articles?')) clearBookmarks();
                }}
                id="saved-clear-all"
              >
                Clear all
              </button>
            )}
          </header>

          {/* ── Empty state ── */}
          {bookmarks.length === 0 ? (
            <div className="saved-empty">
              <div className="saved-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="saved-empty-title">Nothing saved yet</h2>
              <p className="saved-empty-body">
                Tap the bookmark icon on any article to save it here for later reading.
              </p>
              <Link to="/" className="btn btn-primary saved-empty-cta">
                Browse articles
              </Link>
            </div>
          ) : (
            /* ── Article list ── */
            <div className="saved-list">
              {bookmarks.map((article) => (
                <SavedArticleRow key={article._id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SavedPage;
