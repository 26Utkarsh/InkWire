/**
 * @fileoverview Skeleton.jsx — Pulsing gradient skeleton loaders for InkWire.
 * FIXES:
 *   - All skeletons use linear-gradient shimmer animation (not flat grey)
 *   - SecondaryCardSkeleton added for sidebar loading state
 *   - FeaturedSkeleton matches exact featured card dimensions
 */

import React from 'react';
import './Skeleton.css';

/**
 * Generic shimmer block — replace any loading content
 * @param {{ width?: string, height?: string, className?: string, style?: object }} props
 */
export const SkeletonBlock = ({ width = '100%', height = '16px', className = '', style = {} }) => (
  <div className={`skeleton-shimmer ${className}`} style={{ width, height, ...style }} />
);

/** Article card skeleton — matches ArticleCard layout precisely */
export const ArticleCardSkeleton = () => (
  <div className="skeleton-card">
    <SkeletonBlock height="200px" className="skeleton-image" />
    <div className="skeleton-content">
      <SkeletonBlock width="72px" height="20px" className="skeleton-badge" />
      <SkeletonBlock height="20px" />
      <SkeletonBlock height="20px" width="85%" />
      <SkeletonBlock height="14px" width="45%" style={{ marginTop: '4px' }} />
    </div>
  </div>
);

/** Featured hero skeleton — tall card with bottom caption area */
export const FeaturedSkeleton = () => (
  <div className="skeleton-featured">
    <SkeletonBlock height="100%" />
    <div className="skeleton-featured-caption">
      <SkeletonBlock width="80px" height="20px" className="skeleton-badge" />
      <SkeletonBlock height="28px" />
      <SkeletonBlock height="28px" width="70%" />
      <SkeletonBlock height="16px" width="40%" style={{ marginTop: '4px' }} />
    </div>
  </div>
);

/** Secondary sidebar card skeleton — horizontal layout */
export const SecondaryCardSkeleton = () => (
  <div className="skeleton-secondary">
    <div className="skeleton-secondary-body">
      <SkeletonBlock width="60px" height="18px" className="skeleton-badge" />
      <SkeletonBlock height="16px" />
      <SkeletonBlock height="16px" width="75%" />
    </div>
    <SkeletonBlock width="72px" height="56px" className="skeleton-thumb" />
  </div>
);

/** Single-line text skeleton — for headlines, meta text */
export const SkeletonText = ({ lines = 3, lastWidth = '60%' }) => (
  <div className="skeleton-text-group">
    {Array.from({ length: lines }, (_, i) => (
      <SkeletonBlock
        key={i}
        height="16px"
        width={i === lines - 1 ? lastWidth : '100%'}
      />
    ))}
  </div>
);
