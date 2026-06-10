/**
 * @fileoverview sources.config.js — All news sources for InkWire.
 * To add a new source: add one entry here only — nothing else changes.
 */

export const SOURCES = {
  newsapi: {
    enabled: true,
    endpoint: 'https://newsapi.org/v2/top-headlines',
    params: { language: 'en', pageSize: 100 },
    categories: ['general', 'technology', 'business', 'science', 'health'],
    credibilityScore: 85,
  },
  gnews: {
    enabled: true,
    endpoint: 'https://gnews.io/api/v4/top-headlines',
    params: { lang: 'en', max: 100 },
    credibilityScore: 75,
  },
  rss: {
    enabled: true,
    feeds: [
      // === WORLD / GLOBAL TOP SOURCES ===
      {
        name: 'BBC World',
        url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
        topic: 'world',
        credibilityScore: 95,
      },
      {
        name: 'Reuters',
        url: 'https://feeds.reuters.com/reuters/topNews',
        topic: 'world',
        credibilityScore: 98,
      },
      {
        name: 'Al Jazeera',
        url: 'https://www.aljazeera.com/xml/rss/all.xml',
        topic: 'world',
        credibilityScore: 85,
      },
      {
        name: 'Guardian World',
        url: 'https://www.theguardian.com/world/rss',
        topic: 'world',
        credibilityScore: 90,
      },

      // === INDIA NATIONAL NEWS ===
      {
        name: 'The Hindu',
        url: 'https://www.thehindu.com/news/national/?service=rss',
        topic: 'india',
        credibilityScore: 92,
      },
      {
        name: 'The Hindu National',
        url: 'https://www.thehindu.com/news/national/rss.xml',
        topic: 'india',
        credibilityScore: 92,
      },
      {
        name: 'Times of India',
        url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
        topic: 'india',
        credibilityScore: 80,
      },
      {
        name: 'NDTV',
        url: 'https://feeds.feedburner.com/ndtvnews-top-stories',
        topic: 'india',
        credibilityScore: 82,
      },
      {
        name: 'NDTV India',
        url: 'https://feeds.feedburner.com/ndtvnews-india-news',
        topic: 'india',
        credibilityScore: 82,
      },
      {
        name: 'Indian Express',
        url: 'https://indianexpress.com/feed/',
        topic: 'india',
        credibilityScore: 88,
      },
      {
        name: 'Indian Express Politics',
        url: 'https://indianexpress.com/section/political-pulse/feed/',
        topic: 'india',
        credibilityScore: 90,
      },
      {
        name: 'Hindustan Times',
        url: 'https://www.hindustantimes.com/rss/topnews/rssfeed.xml',
        topic: 'india',
        credibilityScore: 82,
      },
      {
        name: 'The Wire',
        url: 'https://thewire.in/feed',
        topic: 'india',
        credibilityScore: 85,
      },
      {
        name: 'The Print',
        url: 'https://theprint.in/feed/',
        topic: 'india',
        credibilityScore: 85,
      },
      {
        name: 'LiveMint',
        url: 'https://www.livemint.com/rss/news',
        topic: 'business',
        credibilityScore: 85,
      },

      // === TECHNOLOGY ===
      {
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        topic: 'technology',
        credibilityScore: 85,
      },
    ],
  },
};
