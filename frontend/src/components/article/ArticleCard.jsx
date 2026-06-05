/**
 * @fileoverview ArticleCard.jsx — Standard article card for grids and lists.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import ArticleMeta from './ArticleMeta.jsx';
import './ArticleCard.css';

/**
 * Standard article card
 * @param {object} props
 * @param {object} props.article
 */
const ArticleCard = ({ article }) => (
  <article className="card article-card animate-fade-in-up">
    {article.imageUrl && (
      <Link to={`/article/${article.slug}`} tabIndex="-1" aria-hidden="true">
        <div className="article-card-image-wrap">
          <img
            src={article.imageUrl}
            alt={article.headline}
            className="article-card-image"
            loading="lazy"
          />
        </div>
      </Link>
    )}
    <div className="article-card-body">
      <ArticleMeta article={article} />
      <h2 className="article-card-headline">
        <Link to={`/article/${article.slug}`} className="link-article">
          {article.headline}
        </Link>
      </h2>
      {article.summary && (
        <p className="article-card-summary">{article.summary}</p>
      )}
      <Link to={`/article/${article.slug}`} className="article-card-cta">
        Read article →
      </Link>
    </div>
  </article>
);

export default ArticleCard;
