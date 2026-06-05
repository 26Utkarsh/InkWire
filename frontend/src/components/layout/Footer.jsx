/**
 * @fileoverview Footer.jsx — Site footer for InkWire public site.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { TOPICS } from '../../constants/index.js';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner container">
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">InkWire</Link>
            <p className="footer-tagline">The world's most important stories, written for you.</p>
            <p className="footer-disclaimer">Articles are AI-assisted and editorially reviewed for accuracy and balance.</p>
          </div>

          {/* Topics */}
          <div className="footer-section">
            <h4 className="footer-heading">Topics</h4>
            <ul className="footer-links">
              {TOPICS.map((topic) => (
                <li key={topic.id}>
                  <Link to={`/topic/${topic.id}`} className="footer-link">{topic.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="footer-section">
            <h4 className="footer-heading">InkWire</h4>
            <ul className="footer-links">
              <li><Link to="/about" className="footer-link">About</Link></li>
              <li><Link to="/archive" className="footer-link">Archive</Link></li>
              <li><Link to="/privacy-policy" className="footer-link">Privacy Policy</Link></li>
              <li><Link to="/terms" className="footer-link">Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} InkWire. All rights reserved.
          </p>
          <p className="footer-adsense">
            This site uses Google AdSense for advertising.{' '}
            <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
