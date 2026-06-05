/**
 * @fileoverview NewsletterForm.jsx — Newsletter signup form component for InkWire.
 */

import React, { useState } from 'react';
import { subscribeNewsletter } from '../../services/newsletterService.js';
import useAppStore from '../../store/useAppStore.js';
import './NewsletterForm.css';

/**
 * Newsletter signup form — homepage bar variant
 * @param {object} props
 * @param {'bar'|'card'} [props.variant]
 * @param {string} [props.source]
 */
const NewsletterForm = ({ variant = 'bar', source = 'homepage' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const addToast = useAppStore((s) => s.addToast);

  /**
   * Handle form submission
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      await subscribeNewsletter(email.trim(), source);
      setDone(true);
      setEmail('');
      addToast('Subscribed! You\'ll get InkWire\'s daily brief in your inbox.', 'success');
    } catch (err) {
      addToast('Subscription failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className={`newsletter-form newsletter-${variant} newsletter-done`}>
        <span className="newsletter-done-icon">✓</span>
        <span>You're subscribed! Watch your inbox.</span>
      </div>
    );
  }

  return (
    <section className={`newsletter-form newsletter-${variant}`}>
      <div className="newsletter-content">
        <div className="newsletter-text">
          <h3 className="newsletter-title">Get InkWire in your inbox</h3>
          <p className="newsletter-desc">The world's most important stories, delivered daily at 8:30 AM.</p>
        </div>
        <form className="newsletter-inputs" onSubmit={handleSubmit} noValidate>
          <input
            id="newsletter-email"
            className="input newsletter-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email address for newsletter"
          />
          <button
            type="submit"
            className="btn btn-primary newsletter-submit"
            disabled={loading}
            id="newsletter-submit-btn"
          >
            {loading ? 'Subscribing...' : 'Subscribe Free'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterForm;
