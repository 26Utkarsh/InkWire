/**
 * @fileoverview NewsService.js — Fetches headlines from all news sources.
 * Handles NewsAPI, GNews, and RSS feeds with deduplication.
 */

import axios from 'axios';
import RSSParser from 'rss-parser';
import { SOURCES } from '../config/sources.config.js';
import { logger } from '../utils/logger.js';
import { NEWS } from '../config/constants.js';

const rssParser = new RSSParser();

/**
 * Fetch headlines from NewsAPI
 * @returns {Promise<object[]>} Array of headline objects
 */
const fetchFromNewsAPI = async () => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) return [];

    const config = SOURCES.newsapi;
    if (!config.enabled) return [];

    const results = [];
    for (const category of config.categories) {
      const response = await axios.get(config.endpoint, {
        params: { ...config.params, category, apiKey },
        timeout: 10000,
      });

      const articles = response.data?.articles || [];
      results.push(...articles.map((a) => ({
        title: a.title,
        description: a.description,
        url: a.url,
        source: a.source?.name || 'NewsAPI',
        publishedAt: a.publishedAt,
        credibilityScore: config.credibilityScore,
      })));
    }
    logger.info(`[NEWS] NewsAPI: fetched ${results.length} headlines`);
    return results;
  } catch (err) {
    logger.warn(`[NEWS] NewsAPI failed: ${err.message}`);
    return [];
  }
};

/**
 * Fetch headlines from GNews
 * @returns {Promise<object[]>} Array of headline objects
 */
const fetchFromGNews = async () => {
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) return [];

    const config = SOURCES.gnews;
    if (!config.enabled) return [];

    const response = await axios.get(config.endpoint, {
      params: { ...config.params, apikey: apiKey },
      timeout: 10000,
    });

    const articles = response.data?.articles || [];
    const results = articles.map((a) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      source: a.source?.name || 'GNews',
      publishedAt: a.publishedAt,
      credibilityScore: config.credibilityScore,
    }));

    logger.info(`[NEWS] GNews: fetched ${results.length} headlines`);
    return results;
  } catch (err) {
    logger.warn(`[NEWS] GNews failed: ${err.message}`);
    return [];
  }
};

/**
 * Fetch headlines from a single RSS feed
 * @param {object} feed - Feed config object from sources.config.js
 * @returns {Promise<object[]>} Array of headline objects
 */
const fetchFromRSSFeed = async (feed) => {
  try {
    const parsed = await rssParser.parseURL(feed.url);
    const items = (parsed.items || []).slice(0, NEWS.MAX_HEADLINES_PER_SOURCE);

    return items.map((item) => ({
      title: item.title,
      description: item.contentSnippet || item.summary,
      url: item.link,
      source: feed.name,
      publishedAt: item.pubDate || item.isoDate,
      topic: feed.topic,
      credibilityScore: feed.credibilityScore,
    }));
  } catch (err) {
    logger.warn(`[NEWS] RSS ${feed.name} failed: ${err.message}`);
    return [];
  }
};

/**
 * Fetch from all RSS feeds in parallel
 * @returns {Promise<object[]>} Combined array of headline objects
 */
const fetchFromRSS = async () => {
  if (!SOURCES.rss.enabled) return [];
  const results = await Promise.allSettled(
    SOURCES.rss.feeds.map((feed) => fetchFromRSSFeed(feed))
  );
  const headlines = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  logger.info(`[NEWS] RSS feeds: fetched ${headlines.length} headlines`);
  return headlines;
};

/**
 * Deduplicate headlines by title similarity (basic word overlap)
 * @param {object[]} headlines - Raw headline objects
 * @returns {object[]} Deduplicated array
 */
const deduplicateHeadlines = (headlines) => {
  const seen = new Set();
  return headlines.filter((h) => {
    if (!h.title) return false;
    const key = h.title.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').slice(0, 6).join(' ');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Fetch all headlines from all sources and deduplicate
 * @returns {Promise<object[]>} Deduplicated array of headline objects
 */
export const fetchAllHeadlines = async () => {
  const [newsApiHeadlines, gnewsHeadlines, rssHeadlines] = await Promise.allSettled([
    fetchFromNewsAPI(),
    fetchFromGNews(),
    fetchFromRSS(),
  ]);

  const all = [
    ...(newsApiHeadlines.status === 'fulfilled' ? newsApiHeadlines.value : []),
    ...(gnewsHeadlines.status === 'fulfilled' ? gnewsHeadlines.value : []),
    ...(rssHeadlines.status === 'fulfilled' ? rssHeadlines.value : []),
  ];

  const deduped = deduplicateHeadlines(all);
  logger.info(`[NEWS] Total unique headlines: ${deduped.length}`);
  return deduped;
};
