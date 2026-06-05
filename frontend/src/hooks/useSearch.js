/**
 * @fileoverview useSearch.js — Custom hook for article search with debounce.
 */

import { useState, useEffect, useRef } from 'react';
import { searchArticles } from '../services/articleService.js';

const DEBOUNCE_MS = 400;

/**
 * Hook for search with debounced API call
 * @param {string} query - Search query string
 * @returns {{results, loading, error}}
 */
export const useSearch = (query) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const data = await searchArticles(query.trim());
        setResults(data.data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { results, loading, error };
};
