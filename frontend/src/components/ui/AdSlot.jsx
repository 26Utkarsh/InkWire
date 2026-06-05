/**
 * @fileoverview AdSlot.jsx — Google AdSense wrapper component for InkWire.
 * Replace data-ad-slot values with your actual AdSense slot IDs after approval.
 */

import React, { useEffect, useRef } from 'react';
import './AdSlot.css';

/** Ad unit configurations — compact sizes, articles first */
const AD_CONFIGS = {
  leaderboard: { width: '728px', height: '50px',  slot: 'XXXXXXXXXX', label: 'Ad' },
  rectangle:   { width: '300px', height: '150px', slot: 'XXXXXXXXXX', label: 'Ad' },
  sidebar:     { width: '300px', height: '400px', slot: 'XXXXXXXXXX', label: 'Ad' },
  mobile:      { width: '320px', height: '50px',  slot: 'XXXXXXXXXX', label: 'Ad' },
};

/**
 * AdSense ad slot wrapper
 * @param {object} props
 * @param {'leaderboard'|'rectangle'|'sidebar'|'mobile'} props.type
 * @param {string} [props.className]
 */
const AdSlot = ({ type = 'rectangle', className = '' }) => {
  const adRef = useRef(null);
  const config = AD_CONFIGS[type] || AD_CONFIGS.rectangle;
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;

  useEffect(() => {
    if (publisherId && publisherId !== 'ca-pub-XXXXXXXXXXXXXXXX') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // AdSense not loaded yet — harmless
      }
    }
  }, [publisherId]);

  /** Show placeholder in development or before AdSense approval */
  if (!publisherId || publisherId === 'ca-pub-XXXXXXXXXXXXXXXX') {
    return (
      <div
        className={`ad-slot ad-slot-${type} ${className}`}
        style={{ width: config.width, height: config.height }}
        aria-hidden="true"
      >
        <span>{config.label}</span>
        <small style={{ display: 'block', fontSize: '10px', marginTop: '4px' }}>
          {config.width} × {config.height}
        </small>
      </div>
    );
  }

  return (
    <div className={`ad-slot-container ad-slot-${type} ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: config.width, height: config.height }}
        data-ad-client={publisherId}
        data-ad-slot={config.slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSlot;
