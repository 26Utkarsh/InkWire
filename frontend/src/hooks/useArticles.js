/**
 * @fileoverview useArticles.js — Custom hook for fetching and caching articles.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchArticles, fetchFeaturedArticle, fetchArticlesByTopic } from '../services/articleService.js';

/**
 * Hook for paginated article list with infinite scroll support
 * @param {number} initialPage
 * @returns {{articles, loading, error, page, totalPages, hasMore, loadMore}}
 */
export const useArticles = (initialPage = 1) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);

  const loadPage = useCallback(async (p, append = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      setLoading(true);
      const data = await fetchArticles(p);
      setArticles((prev) => append ? [...prev, ...data.data] : data.data);
      setTotalPages(data.pagination?.pages || 1);
      setPage(p);
      setHasMore(p < (data.pagination?.pages || 1));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadPage(initialPage);
  }, [initialPage, loadPage]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    await loadPage(page + 1, true);
  }, [hasMore, page, loadPage]);

  return { articles, loading, error, page, totalPages, hasMore, loadMore };
};

/**
 * Hook for featured article
 * @returns {{featured, loading, error}}
 */
export const useFeaturedArticle = () => {
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchFeaturedArticle();
        setFeatured(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { featured, loading, error };
};

/**
 * Hook for topic-filtered articles
 * @param {string} topicId
 * @returns {{articles, loading, error}}
 */
export const useTopicArticles = (topicId) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!topicId) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchArticlesByTopic(topicId);
        setArticles(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [topicId]);

  return { articles, loading, error };
};
