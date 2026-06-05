/**
 * @fileoverview ImageService.js — Fetches relevant article images from Unsplash.
 * Matches query to topic for relevant editorial photography.
 */

import axios from 'axios';
import { IMAGE } from '../config/constants.js';
import { logger } from '../utils/logger.js';

/** Default search query fallback per topic */
const TOPIC_QUERIES = {
  world: 'world news globe international',
  india: 'india city architecture',
  technology: 'technology digital innovation',
  business: 'business finance economy',
  science: 'science research laboratory',
  politics: 'government politics parliament',
};

/**
 * Fetch a relevant image from Unsplash for the given topic and headline
 * @param {string} topic - Topic id
 * @param {string} headline - Article headline for search query
 * @returns {Promise<{url: string, credit: string}>} Image URL and photographer credit
 */
export const fetchImage = async (topic, headline) => {
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      logger.warn('[IMAGE] UNSPLASH_ACCESS_KEY not set — using placeholder');
      return getPlaceholder(topic);
    }

    const query = buildQuery(topic, headline);
    const response = await axios.get(`${IMAGE.UNSPLASH_BASE}/photos/random`, {
      params: {
        query,
        orientation: IMAGE.ORIENTATION,
        w: IMAGE.DEFAULT_WIDTH,
        h: IMAGE.DEFAULT_HEIGHT,
      },
      headers: { Authorization: `Client-ID ${accessKey}` },
      timeout: 8000,
    });

    const photo = response.data;
    return {
      url: photo.urls?.regular || photo.urls?.full,
      credit: `Photo by ${photo.user?.name || 'Unknown'} on Unsplash`,
    };
  } catch (err) {
    logger.warn(`[IMAGE] Unsplash fetch failed: ${err.message} — using placeholder`);
    return getPlaceholder(topic);
  }
};

/**
 * Build Unsplash search query from topic and headline keywords
 * @param {string} topic - Topic id
 * @param {string} headline - Article headline
 * @returns {string} Search query string
 */
const buildQuery = (topic, headline) => {
  const topicBase = TOPIC_QUERIES[topic] || 'news world';
  const keywords = headline
    .replace(/[^a-zA-Z ]/g, '')
    .split(' ')
    .filter((w) => w.length > 4)
    .slice(0, 3)
    .join(' ');
  return `${keywords} ${topicBase}`.trim();
};

/**
 * Return a placeholder image from Unsplash Source (no API key needed)
 * @param {string} topic - Topic id for relevant placeholder
 * @returns {{url: string, credit: string}}
 */
const getPlaceholder = (topic) => {
  const queries = {
    world: 'world,globe',
    india: 'india,city',
    technology: 'technology,digital',
    business: 'business,city',
    science: 'science,nature',
    politics: 'architecture,government',
  };
  const q = queries[topic] || 'news';
  return {
    url: `https://source.unsplash.com/${IMAGE.DEFAULT_WIDTH}x${IMAGE.DEFAULT_HEIGHT}/?${q}`,
    credit: 'Photo via Unsplash',
  };
};
