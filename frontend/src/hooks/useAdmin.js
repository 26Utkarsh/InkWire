/**
 * @fileoverview useAdmin.js — Custom hook for admin dashboard operations.
 */

import { useState, useEffect } from 'react';
import { getQueue, getStats, getPublished } from '../services/adminService.js';

/**
 * Hook for admin article queue
 * @returns {{drafts, loading, error, reload}}
 */
export const useQueue = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getQueue();
      setDrafts(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return { drafts, loading, error, reload: load };
};

/**
 * Hook for admin stats dashboard
 * @returns {{stats, loading, error}}
 */
export const useAdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getStats();
        setStats(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { stats, loading, error };
};
