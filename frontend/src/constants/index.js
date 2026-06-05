/**
 * @fileoverview index.js — Frontend constants for InkWire.
 */

/** All topic definitions matching backend config */
export const TOPICS = [
  { id: 'world',      label: 'World',      color: '#2563eb' },
  { id: 'india',      label: 'India',      color: '#f97316' },
  { id: 'technology', label: 'Technology', color: '#7c3aed' },
  { id: 'business',   label: 'Business',   color: '#059669' },
  { id: 'science',    label: 'Science',    color: '#0891b2' },
  { id: 'politics',   label: 'Politics',   color: '#dc2626' },
];

/** Date display format */
export const DATE_FORMAT = 'MMMM d, yyyy';

/** Short date format for meta */
export const DATE_SHORT = 'MMM d, yyyy';

/** Toast display duration in ms */
export const TOAST_DURATION = 4000;

/** Articles per page for public listing */
export const PAGE_SIZE = 10;

/** Social share URLs */
export const SHARE = {
  TWITTER_BASE: 'https://twitter.com/intent/tweet',
  WHATSAPP_BASE: 'https://wa.me/?text=',
};

/** AdSense Publisher ID — replace with actual ID after approval */
export const ADSENSE_PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX';
