/**
 * @fileoverview topics.config.js — Topic definitions for InkWire.
 * To add a new topic: add one entry here only — nothing else changes.
 */

export const TOPICS = [
  {
    id: 'world',
    label: 'World',
    color: '#2563eb',
    keywords: ['global', 'international', 'UN', 'war', 'peace', 'summit', 'foreign', 'conflict'],
  },
  {
    id: 'india',
    label: 'India',
    color: '#f97316',
    keywords: ['india', 'modi', 'delhi', 'mumbai', 'parliament', 'BJP', 'congress', 'indian', 'rupee', 'loksabha'],
  },
  {
    id: 'technology',
    label: 'Technology',
    color: '#7c3aed',
    keywords: ['AI', 'tech', 'startup', 'Apple', 'Google', 'Microsoft', 'OpenAI', 'software', 'digital', 'cyber'],
  },
  {
    id: 'business',
    label: 'Business',
    color: '#059669',
    keywords: ['economy', 'market', 'stock', 'trade', 'GDP', 'inflation', 'RBI', 'finance', 'bank', 'investment'],
  },
  {
    id: 'science',
    label: 'Science',
    color: '#0891b2',
    keywords: ['space', 'ISRO', 'NASA', 'research', 'discovery', 'climate', 'environment', 'health', 'medicine'],
  },
  {
    id: 'politics',
    label: 'Politics',
    color: '#dc2626',
    keywords: ['election', 'government', 'minister', 'policy', 'law', 'vote', 'president', 'senate', 'parliament'],
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
