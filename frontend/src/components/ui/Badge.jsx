/**
 * @fileoverview Badge.jsx — Topic/status badge component for InkWire.
 */

import React from 'react';

/**
 * Topic/status badge
 * @param {object} props
 * @param {string} props.topic - Topic id or status string
 * @param {string} [props.label] - Display label (defaults to topic)
 * @param {'sm'|'md'} [props.size]
 */
const Badge = ({ topic, label, size = 'md' }) => {
  const displayLabel = label || topic;
  const className = `badge badge-${topic} ${size === 'sm' ? 'badge-sm' : ''}`;
  return <span className={className}>{displayLabel}</span>;
};

export default Badge;
