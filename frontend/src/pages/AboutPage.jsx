/**
 * @fileoverview AboutPage.jsx — About InkWire page (required for AdSense approval).
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import './StaticPage.css';

const AboutPage = () => (
  <>
    <Helmet>
      <title>About InkWire | AI-Powered News Platform</title>
      <meta name="description" content="InkWire is an AI-powered news platform delivering editorially reviewed global news covering world events, India, technology, business, science, and politics." />
      <link rel="canonical" href={`${window.location.origin}/about`} />
    </Helmet>

    <div className="page-wrapper">
      <div className="container static-page">
        <header className="static-header">
          <h1 className="static-title">About InkWire</h1>
          <p className="static-subtitle">The world's most important stories, written for you.</p>
        </header>

        <div className="static-body">
          <h2>Our Mission</h2>
          <p>InkWire delivers the world's most important news stories in clear, factual, and accessible language. We believe quality journalism should be available to everyone — free from paywalls, free from sensationalism.</p>

          <h2>How Articles Are Written</h2>
          <p>InkWire uses a combination of artificial intelligence and editorial review to produce every article:</p>
          <ul>
            <li>Our system monitors thousands of global news sources daily including Reuters, BBC World, The Hindu, Times of India, TechCrunch, and Al Jazeera.</li>
            <li>An AI ranking system selects the six most significant stories of the day based on global impact, India relevance, recency, and source credibility.</li>
            <li>Google's Gemini AI writes a complete 850–1100 word article in Bloomberg/NYT editorial style for each story.</li>
            <li>Every article is reviewed, edited if needed, and approved by our editorial team before publishing. We never auto-publish without human review.</li>
          </ul>

          <h2>Editorial Standards</h2>
          <ul>
            <li><strong>Accuracy:</strong> All claims are attributed to named sources. We do not publish speculation presented as fact.</li>
            <li><strong>Balance:</strong> We present multiple perspectives, especially on contested political or social issues.</li>
            <li><strong>Sourcing:</strong> Every article lists its source publications. Readers are encouraged to read primary sources.</li>
            <li><strong>AI Transparency:</strong> We are transparent that InkWire uses AI for initial article drafting. All articles carry editorial review before publishing.</li>
          </ul>

          <h2>Our Coverage</h2>
          <p>InkWire covers six topic areas: World News, India, Technology, Business, Science, and Politics. We publish 4–6 articles daily at scheduled times: 8:00 AM, 1:00 PM, and 7:00 PM IST.</p>

          <h2>India Focus</h2>
          <p>InkWire was built with Indian readers as a primary audience. We ensure every story includes the India angle where relevant — whether that's an international development's impact on Indian markets, India's position on a global issue, or domestic news of national importance.</p>

          <h2>Contact</h2>
          <p>For editorial queries, corrections, or feedback, contact us at: <a href="mailto:editorial@inkwire.in">editorial@inkwire.in</a></p>

          <p>For advertising or partnership inquiries: <a href="mailto:ads@inkwire.in">ads@inkwire.in</a></p>
        </div>
      </div>
    </div>
  </>
);

export default AboutPage;
