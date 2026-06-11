/**
 * @fileoverview BookmarkButton.jsx — Reusable save/bookmark toggle button.
 * Connects to Zustand store; persists to localStorage automatically.
 */

import React from 'react';
import useAppStore from '../../store/useAppStore.js';
import './BookmarkButton.css';

/**
 * @param {object} props
 * @param {object} props.article   — Full article object (needs _id, slug, headline, etc.)
 * @param {'icon' | 'pill'} props.variant — icon = bare icon only; pill = icon + label
 * @param {string}  props.className  — extra class names
 */
const BookmarkButton = ({ article, variant = 'icon', className = '' }) => {
  const toggleBookmark = useAppStore((s) => s.toggleBookmark);
  const bookmarks      = useAppStore((s) => s.bookmarks);
  const saved = bookmarks.some((b) => b._id === article?._id);

  if (!article?._id) return null;

  const handleClick = (e) => {
    e.preventDefault();   // prevent card link navigation
    e.stopPropagation();
    toggleBookmark(article);
  };

  return (
    <button
      className={`bookmark-btn bookmark-btn--${variant} ${saved ? 'bookmark-btn--saved' : ''} ${className}`}
      onClick={handleClick}
      aria-label={saved ? 'Remove from saved articles' : 'Save article'}
      aria-pressed={saved}
      title={saved ? 'Saved — click to remove' : 'Save article'}
      id={`bookmark-${article._id}`}
    >
      {/* Bookmark icon — filled when saved */}
      <svg
        className="bookmark-btn-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>

      {variant === 'pill' && (
        <span className="bookmark-btn-label">
          {saved ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
};

export default BookmarkButton;
