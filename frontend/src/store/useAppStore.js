/**
 * @fileoverview useAppStore.js — Zustand global state store for InkWire frontend.
 * SECURITY: JWT token is no longer stored in localStorage or in any JS-accessible location.
 * The HttpOnly cookie is managed entirely by the browser and sent automatically on every request.
 * `isAuthenticated` is determined by a server-side /auth/verify call, not by inspecting a token.
 */

import { create } from 'zustand';
import { api } from '../config/api.js';

const useAppStore = create((set, get) => ({
  // === AUTH ===
  isAuthenticated: false,
  adminEmail: null,
  checkingAuth: true,

  /**
   * Mark session as authenticated (called after login success)
   * @param {string} email
   */
  setAuthenticated: (email) => {
    set({ isAuthenticated: true, adminEmail: email, checkingAuth: false });
  },

  /**
   * Clear auth state — the HttpOnly cookie is cleared by calling POST /auth/logout
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      set({ isAuthenticated: false, adminEmail: null });
    }
  },

  /**
   * Check if user is authenticated via backend
   */
  checkAuth: async () => {
    try {
      const res = await api.get('/auth/verify');
      if (res.data?.success) {
        set({ isAuthenticated: true, adminEmail: res.data.admin.email, checkingAuth: false });
      } else {
        set({ isAuthenticated: false, adminEmail: null, checkingAuth: false });
      }
    } catch (err) {
      set({ isAuthenticated: false, adminEmail: null, checkingAuth: false });
    }
  },

  // === TOASTS ===
  toasts: [],

  /**
   * Add toast notification
   * @param {string} message
   * @param {'success'|'error'|'info'|'warning'} type
   */
  addToast: (message, type = 'info') => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },

  /**
   * Remove toast by id
   * @param {number} id
   */
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  // === UI ===
  mobileMenuOpen: false,

  /** Toggle mobile navigation */
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

  /** Close mobile navigation */
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
}));

export default useAppStore;
