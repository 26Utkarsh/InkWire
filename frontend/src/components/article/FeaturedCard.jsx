/**
 * @fileoverview FeaturedCard.jsx — Hero featured article card for InkWire homepage.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import ArticleMeta from './ArticleMeta.jsx';
import { makeImageErrorHandler } from '../../utils/imageUtils.js';
import './FeaturedCard.css';

/**
 * Large hero article card for homepage featured slot
 * @param {object} props
 * @param {object} props.article
 */
const FeaturedCard = ({ article }) => (
  <article className="featured-card animate-fade-in">
    <Link to={`/article/${article.slug}`} className="featured-card-link" aria-label={article.headline}>
      <div className="featured-card-image-wrap">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.headline}
            className="featured-card-image"
            onError={makeImageErrorHandler(article.topic, article.slug)}
          />
        ) : (
          <div className="featured-card-placeholder" />
        )}
        <div className="featured-card-overlay" />
      </div>

      <div className="featured-card-content">
        <ArticleMeta article={article} />
        <h1 className="featured-card-headline">{article.headline}</h1>
        {article.subheadline && (
          <p className="featured-card-subheadline">{article.subheadline}</p>
        )}
        <span className="featured-card-cta">Read full story →</span>
      </div>
    </Link>
  </article>
);

export default FeaturedCard;
