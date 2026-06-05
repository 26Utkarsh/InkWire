/**
 * @fileoverview readTime.js — Calculate estimated article read time.
 */

import { ARTICLE } from '../config/constants.js';

/**
 * Calculate estimated read time in minutes from word count
 * @param {number} wordCount - Total words in the article
 * @returns {number} Estimated minutes to read (minimum 1)
 */
export const calculateReadTime = (wordCount) => {
  const minutes = Math.ceil(wordCount / ARTICLE.WORDS_PER_MINUTE);
  return Math.max(1, minutes);
};

/**
 * Count words in a string
 * @param {string} text - Raw text content
 * @returns {number} Word count
 */
export const countWords = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};
