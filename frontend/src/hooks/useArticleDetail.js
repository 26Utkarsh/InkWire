/**
 * @fileoverview useArticleDetail.js — Hook for single article fetch by slug.
 */

import { useState, useEffect } from 'react';
import { fetchArticleBySlug } from '../services/articleService.js';

/**
 * Hook to fetch a single article by slug
 * @param {string} slug
 * @returns {{article, loading, error}}
 */
export const useQuery = (slug) => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchArticleBySlug(slug);
        setArticle(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  return { article, loading, error };
};
