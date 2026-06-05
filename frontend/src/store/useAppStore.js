/**
 * @fileoverview useAppStore.js — Zustand global state store for InkWire frontend.
 */

import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // === AUTH ===
  token: localStorage.getItem('inkwire_token') || null,
  isAuthenticated: !!localStorage.getItem('inkwire_token'),

  /**
   * Set JWT token and persist to localStorage
   * @param {string} token
   */
  setToken: (token) => {
    localStorage.setItem('inkwire_token', token);
    set({ token, isAuthenticated: true });
  },

  /**
   * Clear auth state and localStorage
   */
  logout: () => {
    localStorage.removeItem('inkwire_token');
    set({ token: null, isAuthenticated: false });
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
