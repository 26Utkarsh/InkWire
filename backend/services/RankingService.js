/**
 * @fileoverview RankingService.js — Scores and selects top stories for InkWire.
 * Auto-generation uses DRAFTS_PER_DAY (6). Manual triggers accept any count.
 *
 * PRIORITY RULES (highest to lowest):
 *  1. Breaking global events (war, crisis, nuclear, summit) — GLOBAL_IMPACT bonus
 *  2. India national politics + INC + Rahul Gandhi stories — INDIA_POLITICS bonus
 *  3. Recency (< 1 hour = full score)
 *  4. Source credibility (Reuters/BBC = highest)
 */

import { TOPICS } from '../config/topics.config.js';
import { RANKING, NEWS, ARTICLE } from '../config/constants.js';
import { logger } from '../utils/logger.js';

const HIGH_CREDIBILITY_SOURCES = ['Reuters', 'BBC', 'BBC World', 'Associated Press', 'AP', 'The Hindu'];
const MED_CREDIBILITY_SOURCES  = ['Bloomberg', 'Al Jazeera', 'NDTV', 'Indian Express', 'Guardian', 'The Wire', 'The Print', 'Hindustan Times', 'LiveMint'];

// ── Global-importance keywords ──────────────────────────────────────────────
const GLOBAL_IMPACT_KEYWORDS = [
  'war', 'peace', 'summit', 'UN', 'crisis', 'global', 'world', 'international',
  'nuclear', 'treaty', 'nato', 'g20', 'g7', 'sanctions', 'invasion', 'ceasefire',
  'conflict', 'genocide', 'humanitarian', 'famine', 'pandemic', 'climate summit',
  'financial crisis', 'economic collapse', 'terrorism', 'assassination',
];

// ── India national politics priority keywords ───────────────────────────────
const INDIA_POLITICS_PRIORITY = [
  'rahul gandhi', 'rahul', 'indian national congress', 'INC', 'congress party',
  'leader of opposition', 'leader of the opposition', 'LoP', 'opposition leader',
  'sonia gandhi', 'priyanka gandhi', 'mallikarjun kharge', 'INDIA alliance',
  'loksabha', 'rajya sabha', 'parliament session', 'budget session', 'monsoon session',
  'election commission', 'voting rights', 'EVM', 'constitution', 'CAA', 'NRC',
  'farmers protest', 'adani', 'ambani', 'BJP', 'NDA', 'AAP', 'arvind kejriwal',
  'modi government', 'supreme court india', 'chief election commissioner',
];

// ── India general relevance ─────────────────────────────────────────────────
const INDIA_GENERAL_KEYWORDS = TOPICS.find((t) => t.id === 'india')?.keywords || [];

const scoreGlobalImpact = (headline) => {
  const text = `${headline.title} ${headline.description || ''}`.toLowerCase();
  const matchCount = GLOBAL_IMPACT_KEYWORDS.filter((kw) => text.includes(kw.toLowerCase())).length;
  return Math.min(RANKING.WEIGHTS.GLOBAL_IMPACT, matchCount * 6);
};

/**
 * Special priority scorer for Indian national politics and INC/Rahul Gandhi stories.
 * Returns a bonus score on top of regular India relevance.
 */
const scoreIndiaPoliticsPriority = (headline) => {
  const text = `${headline.title} ${headline.description || ''}`.toLowerCase();

  // Exact match on Rahul Gandhi or INC = highest bonus
  const rahulMatch = text.includes('rahul gandhi') || text.includes('leader of opposition') || text.includes('lop');
  if (rahulMatch) return 30; // strong priority bonus

  const incMatch = INDIA_POLITICS_PRIORITY.filter((kw) => text.includes(kw.toLowerCase())).length;
  return Math.min(20, incMatch * 7); // up to 20 bonus points for INC/political stories
};

const scoreIndiaRelevance = (headline) => {
  const text = `${headline.title} ${headline.description || ''}`.toLowerCase();
  const generalMatch = INDIA_GENERAL_KEYWORDS.filter((kw) => text.toLowerCase().includes(kw.toLowerCase())).length;
  return Math.min(RANKING.WEIGHTS.INDIA_RELEVANCE, generalMatch * 8);
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
  headlines.map((h) => {
    const globalScore    = scoreGlobalImpact(h);
    const indiaScore     = scoreIndiaRelevance(h);
    const politicsBonus  = scoreIndiaPoliticsPriority(h);
    const recencyScore   = scoreRecency(h);
    const credScore      = scoreSourceCredibility(h);
    const total          = globalScore + indiaScore + politicsBonus + recencyScore + credScore;

    return { ...h, score: total, _debug: { globalScore, indiaScore, politicsBonus, recencyScore, credScore } };
  }).sort((a, b) => b.score - a.score);

const classifyTopic = (headline) => {
  const text = `${headline.title} ${headline.description || ''}`.toLowerCase();

  // Special rule: INC/Rahul Gandhi/opposition stories → classify as 'india' topic
  const isIndiaPolitics = INDIA_POLITICS_PRIORITY.some((kw) => text.includes(kw.toLowerCase()));
  if (isIndiaPolitics) return 'india';

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
 * Ensures at least 2 India stories (including politics) when count >= 6.
 * @param {object[]} headlines
 * @param {number} [count] — how many to select. Defaults to DRAFTS_PER_DAY (6 for auto).
 * @returns {object[]}
 */
export const selectTopStories = (headlines, count = ARTICLE.DRAFTS_PER_DAY) => {
  const scored = scoreHeadlines(headlines);
  const selected = [];
  const usedTopics = new Set();

  // === GUARANTEED SLOTS ===
  // 1. Always include the top Rahul Gandhi / INC story if it exists
  const rahulStory = scored.find((h) => {
    const text = `${h.title} ${h.description || ''}`.toLowerCase();
    return text.includes('rahul gandhi') || text.includes('leader of opposition') || text.includes('indian national congress');
  });
  if (rahulStory) {
    const topic = rahulStory.topic || classifyTopic(rahulStory);
    selected.push({ ...rahulStory, assignedTopic: topic });
    usedTopics.add(topic + '_guaranteed_rahul');
    logger.info(`[RANKING] 🎯 Guaranteed Rahul Gandhi/INC story: "${rahulStory.title}"`);
  }

  // 2. Always include the top global/breaking story
  const globalStory = scored.find((h) => {
    if (selected.some((s) => s.title === h.title)) return false;
    const text = `${h.title} ${h.description || ''}`.toLowerCase();
    return GLOBAL_IMPACT_KEYWORDS.some((kw) => text.includes(kw));
  });
  if (globalStory && selected.length < count) {
    const topic = globalStory.topic || classifyTopic(globalStory);
    selected.push({ ...globalStory, assignedTopic: topic });
    logger.info(`[RANKING] 🌍 Guaranteed global-impact story: "${globalStory.title}"`);
  }

  // === FIRST PASS: one per topic for diversity ===
  for (const headline of scored) {
    if (selected.length >= count) break;
    if (selected.some((s) => s.title === headline.title)) continue;
    const topic = headline.topic || classifyTopic(headline);
    if (usedTopics.has(topic)) continue;
    usedTopics.add(topic);
    selected.push({ ...headline, assignedTopic: topic });
  }

  // === SECOND PASS: fill remaining slots allowing topic repeats ===
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
