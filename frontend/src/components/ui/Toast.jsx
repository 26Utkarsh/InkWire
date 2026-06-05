/**
 * @fileoverview Toast.jsx — Toast notification component for InkWire.
 * Renders floating toast stack from Zustand store.
 */

import React from 'react';
import useAppStore from '../../store/useAppStore.js';
import './Toast.css';

/** Icon map per toast type */
const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

/**
 * Individual toast message
 * @param {{id, message, type}} props
 */
const ToastItem = ({ id, message, type }) => {
  const removeToast = useAppStore((s) => s.removeToast);
  return (
    <div className={`toast toast-${type}`} role="alert">
      <span className="toast-icon">{ICONS[type] || ICONS.info}</span>
      <span className="toast-message">{message}</span>
      <button
        className="toast-close"
        onClick={() => removeToast(id)}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
};

/**
 * Toast container — renders all active toasts
 */
const Toast = () => {
  const toasts = useAppStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} />
      ))}
    </div>
  );
};

export default Toast;
