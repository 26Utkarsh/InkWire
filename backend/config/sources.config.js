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
        name: 'The Hindu',
        url: 'https://www.thehindu.com/news/national/?service=rss',
        topic: 'india',
        credibilityScore: 90,
      },
      {
        name: 'Times of India',
        url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
        topic: 'india',
        credibilityScore: 80,
      },
      {
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        topic: 'technology',
        credibilityScore: 85,
      },
      {
        name: 'Al Jazeera',
        url: 'https://www.aljazeera.com/xml/rss/all.xml',
        topic: 'world',
        credibilityScore: 85,
      },
      {
        name: 'NDTV',
        url: 'https://feeds.feedburner.com/ndtvnews-top-stories',
        topic: 'india',
        credibilityScore: 82,
      },
    ],
  },
};
