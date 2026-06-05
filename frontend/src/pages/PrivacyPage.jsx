/**
 * @fileoverview PrivacyPage.jsx — Privacy Policy page (required for AdSense approval).
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import './StaticPage.css';

const PrivacyPage = () => (
  <>
    <Helmet>
      <title>Privacy Policy | InkWire</title>
      <meta name="description" content="InkWire Privacy Policy — how we collect, use, and protect your data." />
      <link rel="canonical" href={`${window.location.origin}/privacy-policy`} />
    </Helmet>

    <div className="page-wrapper">
      <div className="container static-page">
        <header className="static-header">
          <h1 className="static-title">Privacy Policy</h1>
          <p className="static-subtitle">Last updated: June 2025</p>
        </header>

        <div className="static-body">
          <h2>What Data We Collect</h2>
          <p><strong>Newsletter email addresses:</strong> If you subscribe to our newsletter, we collect your email address. This is used only to send you InkWire's daily brief. We never sell or share your email with third parties.</p>
          <p><strong>Usage analytics:</strong> We track page views and article read counts to understand which stories matter most to our readers. This data is aggregate and not personally identifiable.</p>

          <h2>Cookies</h2>
          <p>InkWire uses Google AdSense to display advertisements. Google AdSense uses cookies to serve ads based on your prior visits to this and other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visits.</p>
          <p>You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google's Ad Settings</a>.</p>

          <h2>Third-Party Services</h2>
          <ul>
            <li><strong>Google AdSense:</strong> Displays advertisements. Uses cookies. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
            <li><strong>Unsplash:</strong> Provides article images. <a href="https://unsplash.com/privacy" target="_blank" rel="noopener noreferrer">Unsplash Privacy Policy</a></li>
          </ul>

          <h2>Data Retention</h2>
          <p>Newsletter subscriber emails are retained until you unsubscribe. You can unsubscribe at any time using the link in any email we send.</p>

          <h2>Your Rights</h2>
          <p>You have the right to request deletion of any personal data we hold about you. Contact us at <a href="mailto:privacy@inkwire.in">privacy@inkwire.in</a> for any data requests.</p>

          <h2>Contact</h2>
          <p>For privacy-related inquiries: <a href="mailto:privacy@inkwire.in">privacy@inkwire.in</a></p>
        </div>
      </div>
    </div>
  </>
);

export default PrivacyPage;
