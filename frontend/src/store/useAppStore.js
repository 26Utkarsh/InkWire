/**
 * @fileoverview useAppStore.js — Zustand global state store for InkWire frontend.
 * SECURITY: JWT token is no longer stored in localStorage or in any JS-accessible location.
 * The HttpOnly cookie is managed entirely by the browser and sent automatically on every request.
 * `isAuthenticated` is determined by a server-side /auth/verify call, not by inspecting a token.
 */

import { create } from 'zustand';
import { api } from '../config/api.js';

/** Load bookmarks from localStorage on startup */
const loadBookmarks = () => {
  try {
    const stored = localStorage.getItem('inkwire_bookmarks');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/** Persist bookmarks to localStorage */
const saveBookmarks = (bookmarks) => {
  try {
    localStorage.setItem('inkwire_bookmarks', JSON.stringify(bookmarks));
  } catch { /* quota exceeded — silently fail */ }
};

const useAppStore = create((set, get) => ({
  // === AUTH ===
  isAuthenticated: false,
  adminEmail: null,
  checkingAuth: true,

  // === BOOKMARKS ===
  bookmarks: loadBookmarks(),

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
   * Toggle bookmark for an article. Saves minimal data needed to render the saved page.
   * @param {object} article — must have: _id, slug, headline, summary, imageUrl, topic, publishedAt
   */
  toggleBookmark: (article) => {
    const current = get().bookmarks;
    const exists = current.some((b) => b._id === article._id);
    const next = exists
      ? current.filter((b) => b._id !== article._id)
      : [
          {
            _id: article._id,
            slug: article.slug,
            headline: article.headline,
            summary: article.summary,
            imageUrl: article.imageUrl,
            topic: article.topic,
            publishedAt: article.publishedAt,
            savedAt: new Date().toISOString(),
          },
          ...current,
        ];
    saveBookmarks(next);
    set({ bookmarks: next });
  },

  /** Check if an article is bookmarked by id */
  isBookmarked: (articleId) => get().bookmarks.some((b) => b._id === articleId),

  /** Total number of saved articles */
  bookmarkCount: () => get().bookmarks.length,

  /** Remove all bookmarks */
  clearBookmarks: () => {
    saveBookmarks([]);
    set({ bookmarks: [] });
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
