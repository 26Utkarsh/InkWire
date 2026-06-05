/**
 * @fileoverview ArticleMeta.jsx — Date, read time, and topic tags for articles.
 */

import React from 'react';
import { format } from 'date-fns';
import Badge from '../ui/Badge.jsx';
import { DATE_SHORT } from '../../constants/index.js';

/**
 * Article metadata display (date, read time, topic)
 * @param {object} props
 * @param {object} props.article
 */
const ArticleMeta = ({ article }) => {
  const dateStr = article.publishedAt
    ? format(new Date(article.publishedAt), DATE_SHORT)
    : 'Unpublished';

  return (
    <div className="article-meta meta">
      <Badge topic={article.topic} label={article.topic?.charAt(0).toUpperCase() + article.topic?.slice(1)} />
      <span className="meta-dot" />
      <time dateTime={article.publishedAt}>{dateStr}</time>
      {article.readTime && (
        <>
          <span className="meta-dot" />
          <span>{article.readTime} min read</span>
        </>
      )}
      {article.wordCount && (
        <>
          <span className="meta-dot" />
          <span>{article.wordCount.toLocaleString()} words</span>
        </>
      )}
    </div>
  );
};

export default ArticleMeta;
