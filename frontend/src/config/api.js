/**
 * @fileoverview api.js — Axios instance and API base URL config for InkWire frontend.
 */

import axios from 'axios';

/** Base URL from environment or relative proxy */
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

/** Configured axios instance with auth token injection */
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/** Inject JWT token from localStorage on every request */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('inkwire_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Handle 401 globally — redirect to login */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('inkwire_token');
      if (window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);
