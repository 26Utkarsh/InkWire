/**
 * @fileoverview RankingService.js — Scores and selects top stories for InkWire.
 * Auto-generation uses DRAFTS_PER_DAY (6). Manual triggers accept any count.
 */

import { TOPICS } from '../config/topics.config.js';
import { RANKING, NEWS, ARTICLE } from '../config/constants.js';
import { logger } from '../utils/logger.js';

const HIGH_CREDIBILITY_SOURCES = ['Reuters', 'BBC', 'BBC World', 'Associated Press', 'AP'];
const MED_CREDIBILITY_SOURCES  = ['The Hindu', 'Bloomberg', 'Al Jazeera', 'NDTV'];

const scoreGlobalImpact = (headline) => {
  const globalKeywords = ['war', 'peace', 'summit', 'UN', 'crisis', 'global', 'world', 'international', 'nuclear', 'treaty'];
  const text = `${headline.title} ${headline.description || ''}`.toLowerCase();
  return Math.min(RANKING.WEIGHTS.GLOBAL_IMPACT, globalKeywords.filter((kw) => text.includes(kw)).length * 5);
};

const scoreIndiaRelevance = (headline) => {
  const indiaKeywords = TOPICS.find((t) => t.id === 'india')?.keywords || [];
  const text = `${headline.title} ${headline.description || ''}`.toLowerCase();
  return Math.min(RANKING.WEIGHTS.INDIA_RELEVANCE, indiaKeywords.filter((kw) => text.toLowerCase().includes(kw.toLowerCase())).length * 8);
};

const scoreRecency = (headline) => {
  if (!headline.publishedAt) return 0;
  const ageHours = (Date.now() - new Date(headline.publishedAt).getTime()) / (1000 * 60 * 60);
  if (ageHours <= 1)                  return RANKING.WEIGHTS.RECENCY;
  if (ageHours <= 3)                  return Math.floor(RANKING.WEIGHTS.RECENCY * 0.75);
  if (ageHours <= NEWS.RECENCY_HOURS) return Math.floor(RANKING.WEIGHTS.RECENCY * 0.5);
  if (ageHours <= 12)                 return Math.floor(RANKING.WEIGHTS.RECENCY * 0.25);
  return 0;
};

const scoreSourceCredibility = (headline) => {
  const s = headline.source || '';
  if (HIGH_CREDIBILITY_SOURCES.some((n) => s.includes(n))) return RANKING.WEIGHTS.SOURCE_CREDIBILITY;
  if (MED_CREDIBILITY_SOURCES.some((n) => s.includes(n)))  return Math.floor(RANKING.WEIGHTS.SOURCE_CREDIBILITY * 0.7);
  return headline.credibilityScore
    ? Math.floor((headline.credibilityScore / 100) * RANKING.WEIGHTS.SOURCE_CREDIBILITY)
    : Math.floor(RANKING.WEIGHTS.SOURCE_CREDIBILITY * 0.4);
};

const scoreHeadlines = (headlines) =>
  headlines.map((h) => ({
    ...h,
    score: scoreGlobalImpact(h) + scoreIndiaRelevance(h) + scoreRecency(h) + scoreSourceCredibility(h),
  })).sort((a, b) => b.score - a.score);

const classifyTopic = (headline) => {
  const text = `${headline.title} ${headline.description || ''}`.toLowerCase();
  let bestTopic = 'world';
  let bestCount = 0;
  for (const topic of TOPICS) {
    const count = topic.keywords.filter((kw) => text.includes(kw.toLowerCase())).length;
    if (count > bestCount) { bestCount = count; bestTopic = topic.id; }
  }
  return bestTopic;
};

/**
 * Select top N unique stories across different topics.
 * @param {object[]} headlines
 * @param {number} [count] — how many to select. Defaults to DRAFTS_PER_DAY (6 for auto).
 * @returns {object[]}
 */
export const selectTopStories = (headlines, count = ARTICLE.DRAFTS_PER_DAY) => {
  const scored = scoreHeadlines(headlines);
  const selected = [];
  const usedTopics = new Set();

  // First pass: one per topic for diversity
  for (const headline of scored) {
    if (selected.length >= count) break;
    const topic = headline.topic || classifyTopic(headline);
    if (usedTopics.has(topic)) continue;
    usedTopics.add(topic);
    selected.push({ ...headline, assignedTopic: topic });
  }

  // Second pass: fill remaining slots allowing topic repeats
  if (selected.length < count) {
    for (const headline of scored) {
      if (selected.length >= count) break;
      if (!selected.some((s) => s.title === headline.title)) {
        selected.push({ ...headline, assignedTopic: headline.topic || classifyTopic(headline) });
      }
    }
  }

  logger.info(`[RANKING] Selected ${selected.length} top stories`);
  return selected;
};

/**
 * Assign publishing slots — cycles morning → afternoon → evening for any count
 * @param {object[]} stories
 * @returns {object[]}
 */
export const assignPublishSlots = (stories) => {
  const slots = ['morning', 'afternoon', 'evening'];
  return stories.map((story, index) => ({
    ...story,
    scheduledFor: slots[index % slots.length],
  }));
};
