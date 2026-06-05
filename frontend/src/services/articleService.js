/**
 * @fileoverview articleService.js — API calls for public article endpoints.
 */

import { api } from '../config/api.js';

/**
 * Fetch paginated published articles
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<object>}
 */
export const fetchArticles = async (page = 1, limit = 10) => {
  const res = await api.get('/articles', { params: { page, limit } });
  return res.data;
};

/**
 * Fetch single article by slug
 * @param {string} slug
 * @returns {Promise<object>}
 */
export const fetchArticleBySlug = async (slug) => {
  const res = await api.get(`/articles/${slug}`);
  return res.data;
};

/**
 * Fetch articles by topic
 * @param {string} topicId
 * @param {number} page
 * @returns {Promise<object>}
 */
export const fetchArticlesByTopic = async (topicId, page = 1) => {
  const res = await api.get(`/articles/topic/${topicId}`, { params: { page } });
  return res.data;
};

/**
 * Search articles by query string
 * @param {string} query
 * @returns {Promise<object>}
 */
export const searchArticles = async (query) => {
  const res = await api.get('/articles/search', { params: { q: query } });
  return res.data;
};

/**
 * Fetch the featured (latest) article
 * @returns {Promise<object>}
 */
export const fetchFeaturedArticle = async () => {
  const res = await api.get('/articles/featured');
  return res.data;
};

/**
 * Fetch articles by date for archive
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<object>}
 */
export const fetchArticlesByDate = async (date) => {
  const res = await api.get('/articles/archive', { params: { date } });
  return res.data;
};

/**
 * Mark article as read (user scrolled 80%+)
 * @param {string} slug
 * @returns {Promise<void>}
 */
export const markAsRead = async (slug) => {
  await api.post(`/articles/${slug}/read`);
};
