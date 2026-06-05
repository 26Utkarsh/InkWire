/**
 * @fileoverview ArticleBody.jsx — Rendered HTML article content with read tracking.
 */

import React, { useEffect, useRef } from 'react';
import { markAsRead } from '../../services/articleService.js';

/**
 * Article body renderer — sanitized HTML from backend
 * Tracks scroll depth for readCount increment
 * @param {object} props
 * @param {string} props.body - Sanitized HTML string
 * @param {string} props.slug - Article slug for read tracking
 */
const ArticleBody = ({ body, slug }) => {
  const bodyRef = useRef(null);
  const readTracked = useRef(false);

  useEffect(() => {
    if (!bodyRef.current || readTracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].intersectionRatio >= 0.8 && !readTracked.current) {
          readTracked.current = true;
          markAsRead(slug).catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.8 }
    );

    observer.observe(bodyRef.current);
    return () => observer.disconnect();
  }, [slug]);

  return (
    <div
      ref={bodyRef}
      className="article-body"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
};

export default ArticleBody;
