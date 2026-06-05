/**
 * @fileoverview slugify.js — Generate URL-safe slugs from headlines.
 */

import slugifyLib from 'slugify';

/**
 * Convert a headline to a URL-safe slug with timestamp suffix for uniqueness
 * @param {string} headline - Article headline
 * @returns {string} URL-safe slug
 */
export const createSlug = (headline) => {
  const base = slugifyLib(headline, {
    lower: true,
    strict: true,
    trim: true,
    replacement: '-',
  });

  const timestamp = Date.now().toString(36);
  return `${base}-${timestamp}`;
};

/**
 * Convert a string to a basic slug without timestamp suffix
 * @param {string} text - Input text
 * @returns {string} URL-safe slug
 */
export const toSlug = (text) =>
  slugifyLib(text, { lower: true, strict: true, trim: true });
