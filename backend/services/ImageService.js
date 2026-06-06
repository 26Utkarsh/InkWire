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

const STOP_WORDS = new Set([
  'highlights', 'visits', 'discuss', 'shows', 'against', 'under', 'about', 
  'after', 'before', 'while', 'during', 'report', 'reports', 'stated', 
  'states', 'claims', 'claim', 'record', 'records', 'first', 'second', 
  'third', 'years', 'month', 'week', 'day', 'hours', 'minutes', 'seconds',
  'people', 'person', 'official', 'officials', 'leader', 'leaders', 'minister',
  'meeting', 'meetings', 'visit', 'talks', 'announces', 'announce', 'announced',
  'unveils', 'unveil', 'unveiled', 'launches', 'launch', 'launched', 'issues',
  'demands', 'demand', 'demanded', 'accuses', 'accuse', 'accused', 'criticizes',
  'criticize', 'criticized', 'slams', 'slam', 'slammed', 'warns', 'warn', 'warned',
  'threat', 'threats', 'threatened', 'risks', 'risk', 'risky', 'seriousness', 'serious'
]);

/**
 * Build Unsplash search query from topic and headline keywords
 * @param {string} topic - Topic id
 * @param {string} headline - Article headline or search term
 * @returns {string} Search query string
 */
const buildQuery = (topic, headline) => {
  const topicBase = TOPIC_QUERIES[topic] || 'news world';
  if (!headline) return topicBase;

  // If the query is already a short 2-3 word query, use it directly
  if (headline.split(/\s+/).length <= 3) {
    return `${headline} ${topicBase}`.trim();
  }

  const keywords = headline
    .replace(/[^a-zA-Z ]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOP_WORDS.has(w.toLowerCase()))
    .slice(0, 3)
    .join(' ');
  return `${keywords} ${topicBase}`.trim();
};

/** Curated list of high-quality, permanent Unsplash image URLs to use as fallbacks */
const PLACEHOLDERS = {
  world: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=800&q=80'
  ],
  india: [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80'
  ],
  technology: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
  ],
  business: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80'
  ],
  science: [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=800&q=80'
  ],
  politics: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80'
  ]
};

/**
 * Return a placeholder image from static curated lists (no API key needed)
 * @param {string} topic - Topic id for relevant placeholder
 * @returns {{url: string, credit: string}}
 */
const getPlaceholder = (topic) => {
  const list = PLACEHOLDERS[topic] || PLACEHOLDERS.world;
  // Pick a random image from the list for variety
  const randomIndex = Math.floor(Math.random() * list.length);
  return {
    url: list[randomIndex],
    credit: 'Photo via Unsplash',
  };
};
