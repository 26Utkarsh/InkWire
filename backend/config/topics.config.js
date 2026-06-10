/**
 * @fileoverview topics.config.js — Topic definitions for InkWire.
 * To add a new topic: add one entry here only — nothing else changes.
 */

export const TOPICS = [
  {
    id: 'world',
    label: 'World',
    color: '#2563eb',
    keywords: ['global', 'international', 'UN', 'war', 'peace', 'summit', 'foreign', 'conflict', 'nato', 'g20', 'g7', 'sanctions', 'crisis', 'treaty', 'diplomacy', 'geopolitical'],
  },
  {
    id: 'india',
    label: 'India',
    color: '#f97316',
    // NOTE: Includes INC, Rahul Gandhi, opposition, LoP for high-priority India political coverage
    keywords: [
      'india', 'modi', 'delhi', 'mumbai', 'parliament', 'BJP', 'congress', 'indian', 'rupee', 'loksabha',
      'rahul', 'gandhi', 'rahul gandhi', 'INC', 'indian national congress', 'opposition leader',
      'leader of opposition', 'LoP', 'sonia gandhi', 'priyanka gandhi', 'mallikarjun kharge',
      'INDIA alliance', 'NDA', 'AAP', 'TMC', 'SP', 'DMK', 'rajya sabha', 'vidhan sabha',
      'CM', 'chief minister', 'governor', 'election commission', 'supreme court india',
      'bharat', 'RSS', 'VHP', 'hindutva', 'secularism', 'constitution india', 'democracy india',
      'budget india', 'RBI', 'GST', 'make in india', 'digital india', 'ISRO',
    ],
  },
  {
    id: 'technology',
    label: 'Technology',
    color: '#7c3aed',
    keywords: ['AI', 'tech', 'startup', 'Apple', 'Google', 'Microsoft', 'OpenAI', 'software', 'digital', 'cyber', 'semiconductor', 'chip', 'robot', 'automation', 'cloud', 'blockchain', 'metaverse'],
  },
  {
    id: 'business',
    label: 'Business',
    color: '#059669',
    keywords: ['economy', 'market', 'stock', 'trade', 'GDP', 'inflation', 'RBI', 'finance', 'bank', 'investment', 'sensex', 'nifty', 'nasdaq', 'dow', 'IMF', 'World Bank', 'exports', 'imports', 'recession', 'growth'],
  },
  {
    id: 'science',
    label: 'Science',
    color: '#0891b2',
    keywords: ['space', 'ISRO', 'NASA', 'research', 'discovery', 'climate', 'environment', 'health', 'medicine', 'vaccine', 'quantum', 'physics', 'biology', 'archaeology', 'fossil', 'astronomy'],
  },
  {
    id: 'politics',
    label: 'Politics',
    color: '#dc2626',
    keywords: [
      'election', 'government', 'minister', 'policy', 'law', 'vote', 'president', 'senate', 'parliament',
      'trump', 'biden', 'democrat', 'republican', 'congress usa', 'white house', 'kremlin', 'xi jinping',
      'putin', 'macron', 'johnson', 'sunak', 'blinken', 'zelensky', 'netanyahu',
      'opposition', 'party', 'coalition', 'referendum', 'campaign', 'poll', 'mandate',
    ],
  },
];

/** @returns {string[]} Array of all topic IDs for schema enum */
export const TOPIC_IDS = TOPICS.map((t) => t.id);

/**
 * Get topic object by id
 * @param {string} id
 * @returns {object|undefined}
 */
export const getTopicById = (id) => TOPICS.find((t) => t.id === id);
