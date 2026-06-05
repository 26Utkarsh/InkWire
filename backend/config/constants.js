/**
 * @fileoverview constants.js — All magic values for InkWire backend.
 * Never use hardcoded numbers elsewhere — import from here.
 */

export const SERVER = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export const DB = {
  CONNECT_TIMEOUT_MS: 10000,
  MAX_POOL_SIZE: 10,
};

export const AUTH = {
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  BCRYPT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_MINUTES: 15,
};

export const ARTICLE = {
  DRAFTS_PER_DAY: 6,          // auto-generation limit (5 AM cron)
  MANUAL_DRAFTS_MAX: 12,      // max articles per manual "Generate Now" trigger
  MORNING_SLOTS: 2,
  AFTERNOON_SLOTS: 2,
  EVENING_SLOTS: 2,
  MIN_WORD_COUNT: 800,
  MAX_WORD_COUNT: 1200,
  WORDS_PER_MINUTE: 200,
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
};

export const AI = {
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
  REQUEST_TIMEOUT_MS: 60000,
  TEMPERATURE: 0.7,
};

export const NEWS = {
  MAX_HEADLINES_PER_SOURCE: 100,
  RECENCY_HOURS: 6,
  DEDUP_SIMILARITY_THRESHOLD: 0.8,
};

export const RANKING = {
  WEIGHTS: {
    GLOBAL_IMPACT: 30,
    INDIA_RELEVANCE: 25,
    RECENCY: 20,
    SOURCE_CREDIBILITY: 15,
    UNIQUENESS: 10,
  },
  TOP_N: 20,    // fetch top 20 candidates; actual count chosen at generation time
};

export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000,
  MAX_REQUESTS: 100,
  ADMIN_MAX_REQUESTS: 200,
};

export const CRON = {
  DAILY_GENERATION: '0 5 * * *',
  MORNING_PUBLISH: '0 8 * * *',
  AFTERNOON_PUBLISH: '0 13 * * *',
  EVENING_PUBLISH: '0 19 * * *',
  ANALYTICS_SNAPSHOT: '0 0 * * *',
  NEWSLETTER_SEND: '30 8 * * *',
};

export const EMAIL = {
  FROM: `"InkWire System" <${process.env.EMAIL_USER}>`,
  SUBJECTS: {
    DAILY_ALERT: '[InkWire] 6 New Articles Ready for Review',
    NEWSLETTER: 'InkWire Daily Brief',
    PUBLISH_REMINDER: '[InkWire] Articles pending review — publishing soon',
  },
};

export const IMAGE = {
  UNSPLASH_BASE: 'https://api.unsplash.com',
  DEFAULT_WIDTH: 1200,
  DEFAULT_HEIGHT: 675,
  ORIENTATION: 'landscape',
};
