/**
 * @fileoverview useArticles.js — Custom hook for fetching and caching articles.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchArticles, fetchFeaturedArticle, fetchArticlesByTopic } from '../services/articleService.js';

/**
 * Hook for paginated article list
 * @param {number} initialPage
 * @returns {{articles, loading, error, page, totalPages, loadPage}}
 */
export const useArticles = (initialPage = 1) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const loadPage = useCallback(async (p) => {
    try {
      setLoading(true);
      const data = await fetchArticles(p);
      setArticles(data.data);
      setTotalPages(data.pagination?.pages || 1);
      setPage(p);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPage(initialPage); }, [initialPage, loadPage]);

  return { articles, loading, error, page, totalPages, loadPage };
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
