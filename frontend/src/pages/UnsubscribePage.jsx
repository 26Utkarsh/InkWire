/**
 * @fileoverview UnsubscribePage.jsx — Unsubscribe page for InkWire newsletter.
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { unsubscribeNewsletter } from '../services/newsletterService.js';
import './StaticPage.css';

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error' | 'invalid'

  useEffect(() => {
    if (!email) {
      setStatus('invalid');
      return;
    }

    const performUnsubscribe = async () => {
      try {
        await unsubscribeNewsletter(email);
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };

    performUnsubscribe();
  }, [email]);

  return (
    <>
      <Helmet>
        <title>Unsubscribe | InkWire</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="page-wrapper">
        <div className="container static-page" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <header className="static-header" style={{ marginBottom: '24px' }}>
            <h1 className="static-title" style={{ fontSize: '2rem' }}>Newsletter Subscription</h1>
          </header>

          <div className="static-body" style={{ maxWidth: '480px', margin: '0 auto' }}>
            {status === 'loading' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
                <p>Processing your unsubscribe request...</p>
              </div>
            )}

            {status === 'success' && (
              <div>
                <div style={{ fontSize: '48px', color: '#10b981', marginBottom: '16px' }}>✓</div>
                <h2 style={{ fontSize: '24px', marginBottom: '12px', fontFamily: 'var(--font-serif)' }}>Successfully Unsubscribed</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  The email address <strong>{email}</strong> has been unsubscribed from the InkWire Daily Brief. You will no longer receive daily newsletters from us.
                </p>
                <Link to="/" className="btn btn-primary">Back to InkWire Home</Link>
              </div>
            )}

            {status === 'error' && (
              <div>
                <div style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px' }}>⚠️</div>
                <h2 style={{ fontSize: '24px', marginBottom: '12px', fontFamily: 'var(--font-serif)' }}>Unsubscribe Failed</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  We encountered an error while trying to unsubscribe <strong>{email}</strong>. Please try again later or contact support.
                </p>
                <Link to="/" className="btn btn-primary">Back to InkWire Home</Link>
              </div>
            )}

            {status === 'invalid' && (
              <div>
                <div style={{ fontSize: '48px', color: '#f59e0b', marginBottom: '16px' }}>ℹ️</div>
                <h2 style={{ fontSize: '24px', marginBottom: '12px', fontFamily: 'var(--font-serif)' }}>No Email Provided</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  Please use the unsubscribe link provided in your newsletter email.
                </p>
                <Link to="/" className="btn btn-primary">Back to InkWire Home</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UnsubscribePage;
