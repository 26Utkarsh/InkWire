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
      return getPlaceholder(topic, headline);
    }

    const query = buildQuery(topic, headline);
    const response = await axios.get(`${IMAGE.UNSPLASH_BASE}/search/photos`, {
      params: {
        query,
        orientation: IMAGE.ORIENTATION,
        per_page: 5,
        order_by: 'relevant',
      },
      headers: { Authorization: `Client-ID ${accessKey}` },
      timeout: 15000,
    });

    const results = response.data?.results || [];
    if (results.length === 0) {
      logger.warn(`[IMAGE] Unsplash search returned no results for: "${query}" — using placeholder`);
      return getPlaceholder(topic, headline);
    }

    const photo = results[0];
    return {
      url: photo.urls?.regular || photo.urls?.full,
      credit: `Photo by ${photo.user?.name || 'Unknown'} on Unsplash`,
    };
  } catch (err) {
    logger.warn(`[IMAGE] Unsplash fetch failed: ${err.message} — using placeholder`);
    return getPlaceholder(topic, headline);
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
  'threat', 'threats', 'threatened', 'risks', 'risk', 'risky', 'seriousness', 'serious',
  // Short grammatical words to exclude when checking length >= 3
  'the', 'and', 'for', 'but', 'not', 'are', 'was', 'were', 'who', 'has', 'had', 'his', 
  'her', 'him', 'its', 'she', 'you', 'they', 'all', 'any', 'one', 'two', 'use', 'can', 
  'how', 'why', 'with', 'from', 'that', 'this', 'have', 'will', 'over', 'more', 'than', 
  'into', 'some', 'them', 'their', 'also', 'been', 'what', 'when', 'said', 'says', 'told', 
  'made', 'make', 'take', 'back', 'just', 'very', 'even', 'only', 'many', 'most', 'such', 
  'well', 'much', 'same', 'both'
]);

/**
 * Build Unsplash search query from topic and headline keywords
 * @param {string} topic - Topic id
 * @param {string} headline - Article headline or search term
 * @returns {string} Search query string
 */
const buildQuery = (topic, headline) => {
  if (!headline) {
    return TOPIC_QUERIES[topic] || 'news world';
  }

  const words = headline.trim().split(/\s+/);
  // If the query is already a short 2-3 word query, use it directly
  if (words.length <= 3) {
    return headline.trim();
  }

  const keywords = headline
    .replace(/[^a-zA-Z ]/g, '')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w.toLowerCase()))
    .slice(0, 3)
    .join(' ');

  if (!keywords) {
    return TOPIC_QUERIES[topic] || 'news world';
  }
  return keywords;
};

/** Curated list of high-quality, permanent Unsplash image URLs to use as fallbacks */
const PLACEHOLDERS = {
  world: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=800&q=80'
  ],
  india: [
    'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80', // India flag
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'  // India parliament
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
 * Keyword-based specific fallback image groups for smart matching on Unsplash failures.
 * IMPORTANT: Order matters — more specific groups should come first.
 */
const TOPIC_FALLBACKS = [
  // === MISSILES & MILITARY ===
  {
    keywords: ['missile', 'missiles', 'pralay', 'agni', 'brahmos', 'ballistic', 'warhead', 'warheads', 'intercontinental', 'icbm', 'strike capability', 'deep strike'],
    images: [
      { url: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=80', credit: 'Photo by NASA on Unsplash' }, // Rocket/missile launch trail
      { url: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800&q=80', credit: 'Photo by SpaceX on Unsplash' }  // Rocket on pad
    ]
  },
  // === MILITARY / DEFENSE ===
  {
    keywords: ['military', 'army', 'navy', 'airforce', 'air force', 'defence', 'defense', 'soldier', 'soldiers', 'troops', 'warfare', 'weapon', 'weapons', 'arsenal', 'nuclear', 'combat', 'war', 'border', 'ceasefire'],
    images: [
      { url: 'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?auto=format&fit=crop&w=800&q=80', credit: 'Photo by Sgt. William Begeman on Unsplash' }, // Military aircraft
      { url: 'https://images.unsplash.com/photo-1541874178072-cc9b26c9b5e3?auto=format&fit=crop&w=800&q=80', credit: 'Photo via Unsplash' }  // Defense/soldier
    ]
  },
  // === ROCKETS & SPACE LAUNCHES (explosion/fire context) ===
  {
    keywords: ['pad explosion', 'pad collapse', 'pad destroyed', 'pad fire', 'launch pad', 'launchpad', 'test fire', 'hot fire', 'abort'],
    images: [
      { url: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800&q=80', credit: 'Photo by SpaceX on Unsplash' }, // Rocket on launchpad
      { url: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=80', credit: 'Photo by NASA on Unsplash' }  // Rocket launch
    ]
  },
  // === SPACE & ROCKETS (general) ===
  {
    keywords: ['rocket', 'spacecraft', 'spaceship', 'space station', 'isro', 'nasa', 'spacex', 'blue origin', 'moon', 'lunar', 'mars', 'satellite', 'astronaut', 'orbit', 'cosmos', 'galaxy', 'telescope', 'chandrayaan', 'gaganyaan', 'artemis'],
    images: [
      { url: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=800&q=80', credit: 'Photo by SpaceX on Unsplash' }, // Rocket
      { url: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=80', credit: 'Photo by NASA on Unsplash' }, // Launch
      { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', credit: 'Photo by NASA on Unsplash' }  // Earth from space
    ]
  },
  // === INDIA SPACE PROGRAM ===
  {
    keywords: ['isro', 'chandrayaan', 'gaganyaan', 'india space', 'india moon', 'india launch', 'india satellite', 'south pole mission', 'lunar south'],
    images: [
      { url: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=80', credit: 'Photo by NASA on Unsplash' }, // Rocket launch
      { url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80', credit: 'Photo via Unsplash' }  // India flag
    ]
  },
  // === FIRE / EXPLOSION (non-space context) ===
  {
    keywords: ['explosion', 'exploded', 'fire', 'blaze', 'smoke', 'destroy', 'destroyed', 'incident', 'accident', 'crash', 'collapse', 'collapsed', 'blast'],
    images: [
      { url: 'https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?auto=format&fit=crop&w=800&q=80', credit: 'Photo by NASA on Unsplash' }, // Fire/smoke
      { url: 'https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?auto=format&fit=crop&w=800&q=80', credit: 'Photo via Unsplash' }  // Fire scene
    ]
  },
  // === STOCK MARKETS & ECONOMY ===
  {
    keywords: ['markets', 'stocks', 'shares', 'equity', 'nifty', 'sensex', 'nasdaq', 'dow jones', 'economy', 'trade', 'finance', 'gold', 'billion', 'million', 'bank', 'banks', 'dollar', 'rupee', 'rupees', 'gdp', 'inflation', 'rally', 'rebound', 'chipmakers'],
    images: [
      { url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80', credit: 'Photo by Chris Liverani on Unsplash' }, // Stock chart
      { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', credit: 'Photo by Sean Pollock on Unsplash' }  // Financial district
    ]
  },
  // === LEGAL / COURTS ===
  {
    keywords: ['court', 'judge', 'verdict', 'law', 'gavel', 'legal', 'lawsuit', 'scrutiny', 'arrest', 'arrested', 'police', 'prison', 'jail', 'sentence', 'sentenced', 'charges', 'charged', 'indicted'],
    images: [
      { url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80', credit: 'Photo by Wesley Tingey on Unsplash' } // Gavel
    ]
  },
  // === POLITICS / ELECTIONS ===
  {
    keywords: ['election', 'elections', 'vote', 'voting', 'voters', 'ballot', 'senate', 'republican', 'democrat', 'parliament', 'modi', 'trump', 'biden', 'rahul', 'gandhi', 'government', 'congress', 'opposition', 'pm', 'prime minister', 'president', 'minister', 'snap election', 'campaign'],
    images: [
      { url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80', credit: 'Photo by Kyle Glenn on Unsplash' }, // Flags
      { url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80', credit: 'Photo by Louis Velazquez on Unsplash' }  // Capitol
    ]
  },
  // === HEALTH / MEDICAL ===
  {
    keywords: ['virus', 'covid', 'pandemic', 'vaccine', 'vaccination', 'health', 'hospital', 'doctor', 'patient', 'medical', 'medicine', 'disease', 'outbreak', 'symptoms', 'treatment', 'cure', 'clinical'],
    images: [
      { url: 'https://images.unsplash.com/photo-1584515906207-f818b86d5c4b?auto=format&fit=crop&w=800&q=80', credit: 'Photo by Clay Banks on Unsplash' }, // Medical
      { url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80', credit: 'Photo via Unsplash' }  // Lab/science
    ]
  },
  // === TECHNOLOGY / AI / CYBER ===
  {
    keywords: ['chip', 'semiconductor', 'microchip', 'ai', 'artificial intelligence', 'robot', 'robotics', 'digital', 'cyber', 'cybersecurity', 'hacker', 'software', 'computer', 'server', 'data', 'algorithm', 'machine learning', 'vpn', 'ransomware', 'bug', 'patch', 'apple', 'google', 'microsoft', 'meta', 'openai', 'chatgpt'],
    images: [
      { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', credit: 'Photo by Alexandre Debiève on Unsplash' }, // Microchip
      { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', credit: 'Photo via Unsplash' }  // Digital code
    ]
  },
  // === CLIMATE & ENVIRONMENT ===
  {
    keywords: ['climate', 'environment', 'global warming', 'carbon', 'emissions', 'green', 'renewable', 'solar', 'wind energy', 'pollution', 'flood', 'drought', 'wildfire', 'weather', 'storm', 'cyclone', 'earthquake'],
    images: [
      { url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80', credit: 'Photo via Unsplash' }, // Earth/environment
      { url: 'https://images.unsplash.com/photo-1530522821769-9c5e244a0cb4?auto=format&fit=crop&w=800&q=80', credit: 'Photo via Unsplash' }  // Nature/green
    ]
  },
  // === SPORTS ===
  {
    keywords: ['cricket', 'ipl', 'bcci', 'football', 'soccer', 'fifa', 'olympics', 'sport', 'sports', 'champion', 'championship', 'tournament', 'match', 'player', 'athlete', 'gold medal', 'world cup'],
    images: [
      { url: 'https://images.unsplash.com/photo-1540747913346-19212a4b423e?auto=format&fit=crop&w=800&q=80', credit: 'Photo via Unsplash' }, // Cricket stadium
      { url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80', credit: 'Photo via Unsplash' }  // Stadium
    ]
  },
  // === ANCIENT / HISTORY / ARCHAEOLOGY ===
  {
    keywords: ['ancient', 'fossil', 'prehistoric', 'dinosaur', 'scorpion', 'gigantism', 'archaeology', 'history', 'historical', 'discovery', 'species', 'extinct', 'evolution', 'paleontology'],
    images: [
      { url: 'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?auto=format&fit=crop&w=800&q=80', credit: 'Photo via Unsplash' }, // Museum/fossil
      { url: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=800&q=80', credit: 'Photo via Unsplash' }  // Research/science
    ]
  },
  // === MIDDLE EAST / GEOPOLITICS ===
  {
    keywords: ['israel', 'gaza', 'hamas', 'iran', 'palestine', 'mideast', 'middle east', 'conflict', 'ceasefire', 'airstrike', 'permacrisis', 'geopolitical', 'tensions'],
    images: [
      { url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80', credit: 'Photo by Kyle Glenn on Unsplash' }, // Flags/world
      { url: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=800&q=80', credit: 'Photo via Unsplash' }  // World globe
    ]
  },
  // === INDIA (general fallback for india topic) ===
  {
    keywords: ['india', 'indian', 'bharat', 'delhi', 'mumbai', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'hyderabad', 'rajasthan', 'gujarat'],
    images: [
      { url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80', credit: 'Photo via Unsplash' }, // India parliament/landmark
      { url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80', credit: 'Photo via Unsplash' }  // India flag
    ]
  }
];

/**
 * Return a placeholder image from static curated lists or smart keyword match
 * @param {string} topic - Topic id for relevant placeholder
 * @param {string} headline - Headline for smart keyword matching
 * @returns {{url: string, credit: string}}
 */
const getPlaceholder = (topic, headline = '') => {
  const text = (headline || '').toLowerCase();
  
  // Try to find a specific keyword-based fallback image first
  for (const group of TOPIC_FALLBACKS) {
    for (const kw of group.keywords) {
      if (text.includes(kw)) {
        const randomIndex = Math.floor(Math.random() * group.images.length);
        const match = group.images[randomIndex];
        logger.info(`[IMAGE] Smart fallback matched keyword "${kw}": ${match.url}`);
        return match;
      }
    }
  }

  // Fall back to category-based lists if no keyword matched
  const list = PLACEHOLDERS[topic] || PLACEHOLDERS.world;
  const randomIndex = Math.floor(Math.random() * list.length);
  return {
    url: list[randomIndex],
    credit: 'Photo via Unsplash',
  };
};
