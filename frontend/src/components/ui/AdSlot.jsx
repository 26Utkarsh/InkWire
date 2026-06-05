/**
 * @fileoverview AdSlot.jsx — Google AdSense wrapper component for InkWire.
 * Returns null (invisible) when no publisher ID is configured — no placeholder box shown.
 * Replace data-ad-slot values with your actual AdSense slot IDs after approval.
 */

import React, { useEffect, useRef } from 'react';
import './AdSlot.css';

/** Ad unit configurations */
const AD_CONFIGS = {
  leaderboard: { width: '728px', height: '90px',  slot: 'XXXXXXXXXX' },
  rectangle:   { width: '300px', height: '250px', slot: 'XXXXXXXXXX' },
  sidebar:     { width: '300px', height: '600px', slot: 'XXXXXXXXXX' },
  mobile:      { width: '320px', height: '50px',  slot: 'XXXXXXXXXX' },
};

/**
 * AdSense ad slot wrapper.
 * IMPORTANT: When VITE_ADSENSE_PUBLISHER_ID is not set or is placeholder,
 * this component renders nothing — no grey box, no placeholder text.
 * @param {object} props
 * @param {'leaderboard'|'rectangle'|'sidebar'|'mobile'} props.type
 * @param {string} [props.className]
 */
const AdSlot = ({ type = 'rectangle', className = '' }) => {
  const adRef = useRef(null);
  const config = AD_CONFIGS[type] || AD_CONFIGS.rectangle;
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;

  // No publisher ID configured → render nothing at all
  if (!publisherId || publisherId === 'ca-pub-XXXXXXXXXXXXXXXX') {
    return null;
  }

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense not loaded yet — harmless
    }
  }, []);

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
