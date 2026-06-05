/**
 * @fileoverview api.js — Axios instance and API base URL config for InkWire frontend.
 * SECURITY: Token is stored in an HttpOnly cookie — never in localStorage or JS memory.
 * `withCredentials: true` tells the browser to automatically include the cookie on every request.
 * No manual token injection needed.
 */

import axios from 'axios';

/** Base URL from environment or relative proxy */
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

/**
 * Configured axios instance.
 * `withCredentials: true` is the key security setting — it tells axios/browser to include
 * the HttpOnly session cookie on cross-origin requests to the backend.
 */
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true,                          // ← sends HttpOnly cookie automatically
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Response interceptor — handle 401 globally.
 * When the server says the session is expired, redirect to login.
 * We do NOT touch localStorage (there's nothing to clear there anymore).
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);
