/**
 * @fileoverview TermsPage.jsx — Terms of Use page for InkWire (required for AdSense).
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import './StaticPage.css';

const TermsPage = () => (
  <>
    <Helmet>
      <title>Terms of Use | InkWire</title>
      <meta name="description" content="InkWire Terms of Use — usage rights and responsibilities for InkWire readers." />
      <link rel="canonical" href={`${window.location.origin}/terms`} />
    </Helmet>

    <div className="page-wrapper">
      <div className="container static-page">
        <header className="static-header">
          <h1 className="static-title">Terms of Use</h1>
          <p className="static-subtitle">Last updated: June 2025</p>
        </header>

        <div className="static-body">
          <h2>Acceptance of Terms</h2>
          <p>By accessing and using InkWire, you agree to these terms. If you do not agree, please do not use this site.</p>

          <h2>Content Ownership</h2>
          <p>All articles published on InkWire are the intellectual property of InkWire. Articles are AI-assisted and editorially reviewed. You may not reproduce, republish, or distribute InkWire content without written permission.</p>

          <h2>AI-Assisted Writing Disclaimer</h2>
          <p>InkWire uses artificial intelligence to assist in article drafting. All AI-generated content is reviewed and approved by our editorial team before publishing. However, InkWire makes no warranty regarding absolute accuracy. Always verify critical information with primary sources.</p>

          <h2>User Conduct</h2>
          <p>Users of InkWire agree to:</p>
          <ul>
            <li>Not use the site for any unlawful purpose</li>
            <li>Not attempt to scrape or systematically download content without permission</li>
            <li>Not attempt to circumvent security measures</li>
          </ul>

          <h2>Advertising</h2>
          <p>InkWire displays advertisements via Google AdSense. We are not responsible for the content of third-party advertisements.</p>

          <h2>Limitation of Liability</h2>
          <p>InkWire is provided "as is." We are not liable for any damages arising from your use of this site or reliance on any content published here.</p>

          <h2>Changes to Terms</h2>
          <p>We may update these terms at any time. Continued use of InkWire after changes constitutes acceptance of the new terms.</p>

          <h2>Contact</h2>
          <p>Questions about these terms: <a href="mailto:legal@inkwire.in">legal@inkwire.in</a></p>
        </div>
      </div>
    </div>
  </>
);

export default TermsPage;
