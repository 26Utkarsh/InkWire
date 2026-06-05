/**
 * @fileoverview newsletterService.js — Newsletter signup API calls.
 */

import { api } from '../config/api.js';

/**
 * Subscribe email to newsletter
 * @param {string} email
 * @param {string} source
 * @returns {Promise<object>}
 */
export const subscribeNewsletter = async (email, source = 'homepage') => {
  const res = await api.post('/newsletter/subscribe', { email, source });
  return res.data;
};

/**
 * Unsubscribe email from newsletter
 * @param {string} email
 * @returns {Promise<object>}
 */
export const unsubscribeNewsletter = async (email) => {
  const res = await api.post('/newsletter/unsubscribe', { email });
  return res.data;
};
