/**
 * @fileoverview imageUtils.js — Image fallback helpers for InkWire.
 * Used by ArticleCard, FeaturedCard, and SecondaryCard to gracefully
 * recover from broken imageUrl values (e.g. old source.unsplash.com links).
 */

/** Curated permanent Unsplash CDN URLs, keyed by topic */
const FALLBACK_IMAGES = {
  world: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=800&q=80',
  ],
  india: [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
  ],
  technology: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
  ],
  business: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
  ],
  science: [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=800&q=80',
  ],
  politics: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80',
  ],
};

/**
 * Returns a stable fallback image URL for a given topic.
 * Uses the article slug (if any) to pick deterministically from the list.
 * @param {string} topic
 * @param {string} [slug]
 * @returns {string}
 */
export const getFallbackImage = (topic, slug = '') => {
  const list = FALLBACK_IMAGES[topic] || FALLBACK_IMAGES.world;
  // Pick deterministically by slug length to avoid always returning the same one
  const idx = slug.length % list.length;
  return list[idx];
};

/**
 * onError handler factory for <img> elements.
 * Swaps a broken src to the curated fallback for the article's topic.
 * @param {string} topic
 * @param {string} [slug]
 * @returns {function} React onError event handler
 */
export const makeImageErrorHandler = (topic, slug) => (e) => {
  const fallback = getFallbackImage(topic, slug);
  // Prevent infinite loop if the fallback itself fails
  if (e.target.src !== fallback) {
    e.target.src = fallback;
  }
};
