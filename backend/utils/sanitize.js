/**
 * @fileoverview sanitize.js — Sanitize AI-generated HTML output before saving.
 * Strips dangerous tags while preserving article formatting.
 */

import sanitizeHtml from 'sanitize-html';

/** Allowed HTML tags for article body content */
const ALLOWED_TAGS = [
  'p', 'h2', 'h3', 'h4',
  'strong', 'em', 'b', 'i', 'u',
  'ul', 'ol', 'li',
  'blockquote',
  'a',
  'br',
  'img',
];

/** Allowed attributes per tag */
const ALLOWED_ATTRIBUTES = {
  a: ['href', 'target', 'rel'],
  blockquote: ['cite'],
  img: ['src', 'alt', 'class', 'style', 'width', 'height'],
};

/**
 * Sanitize HTML string — safe for storing and rendering article body
 * @param {string} html - Raw HTML from AI response
 * @returns {string} Sanitized HTML
 */
export const sanitizeArticleHTML = (html) => {
  if (!html || typeof html !== 'string') return '';

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
      a: ['http', 'https', 'ftp', 'mailto'],
    },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    },
  });
};

/**
 * Strip all HTML tags — returns plain text
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export const stripHTML = (html) => {
  if (!html || typeof html !== 'string') return '';
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
};
