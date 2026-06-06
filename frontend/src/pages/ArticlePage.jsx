/**
 * @fileoverview ArticlePage.jsx — Full article reading page for InkWire.
 * Includes SEO meta, schema markup, AdSense slots, share buttons, related articles.
 */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { useQuery } from '../hooks/useArticleDetail.js';
import ArticleBody from '../components/article/ArticleBody.jsx';
import ArticleMeta from '../components/article/ArticleMeta.jsx';
import AdSlot from '../components/ui/AdSlot.jsx';
import NewsletterForm from '../components/ui/NewsletterForm.jsx';
import useAppStore from '../store/useAppStore.js';
import './ArticlePage.css';

/** Share buttons for Twitter, WhatsApp, and copy link */
const ShareButtons = ({ article }) => {
  const [copied, setCopied] = useState(false);
  const addToast = useAppStore((s) => s.addToast);
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(article.headline);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      addToast('Link copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Could not copy link', 'error');
    }
  };

  return (
    <div className="share-section">
      <span className="share-label">Share:</span>
      <div className="share-buttons">
        <a
          href={`https://twitter.com/intent/tweet?text=${text}&url=${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn"
          id="share-twitter"
          aria-label="Share on Twitter"
        >
          𝕏 Twitter
        </a>
        <a
          href={`https://wa.me/?text=${text}%20${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn"
          id="share-whatsapp"
          aria-label="Share on WhatsApp"
        >
          💬 WhatsApp
        </a>
        <button className="share-btn" onClick={copyLink} id="share-copy" aria-label="Copy link">
          {copied ? '✓ Copied' : '🔗 Copy Link'}
        </button>
      </div>
    </div>
  );
};

const ArticlePage = () => {
  const { slug } = useParams();
  const { article, loading, error } = useQuery(slug);

  if (loading) {
    return (
      <div className="page-wrapper article-page-loading">
        <div className="container">
          <div className="skeleton" style={{ height: '500px', borderRadius: '8px' }} />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="page-wrapper">
        <div className="container article-not-found">
          <h1>Article not found</h1>
          <p>This article may have been removed or the URL is incorrect.</p>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  const getAbsoluteImageUrl = (url) => {
    if (!url) return `${window.location.origin}/logo.png`;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const canonicalUrl = `${window.location.origin}/article/${article.slug}`;
  const absoluteImage = getAbsoluteImageUrl(article.imageUrl);
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.headline,
    description: article.summary,
    image: absoluteImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { '@type': 'Organization', name: 'InkWire Editorial Desk' },
    publisher: {
      '@type': 'Organization',
      name: 'InkWire',
      logo: { '@type': 'ImageObject', url: `${window.location.origin}/favicon.ico` },
    },
    url: canonicalUrl,
  };

  return (
    <>
      <Helmet>
        <title>{article.headline} | InkWire</title>
        <meta name="description" content={article.summary} />
        <meta property="og:title" content={article.headline} />
        <meta property="og:description" content={article.summary} />
        <meta property="og:image" content={absoluteImage} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.headline} />
        <meta name="twitter:description" content={article.summary} />
        <meta name="twitter:image" content={absoluteImage} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
      </Helmet>

      <div className="page-wrapper">
        {/* Top ad */}
        <div className="article-ad-top container">
          <AdSlot type="leaderboard" />
        </div>

        <div className="article-layout container">
          {/* Main article column */}
          <div className="article-main">
            {/* Article header */}
            <header className="article-header">
              <ArticleMeta article={article} />
              <h1 className="article-headline">{article.headline}</h1>
              {article.subheadline && (
                <p className="article-subheadline">{article.subheadline}</p>
              )}
              <div className="article-byline">
                <span>By {article.byline || 'InkWire Editorial Desk'}</span>
                {article.publishedAt && (
                  <span className="meta-dot" aria-hidden="true" />
                )}
                {article.publishedAt && (
                  <time dateTime={article.publishedAt}>
                    {format(new Date(article.publishedAt), 'MMMM d, yyyy')}
                  </time>
                )}
              </div>
              <hr className="article-divider" />
            </header>

            {/* Article image */}
            {article.imageUrl && (
              <figure className="article-figure">
                <img
                  src={article.imageUrl}
                  alt={article.headline}
                  className="article-hero-image"
                />
                {article.imageCredit && (
                  <figcaption className="article-image-credit">{article.imageCredit}</figcaption>
                )}
              </figure>
            )}

            {/* Quick AI Summary */}
            {article.summary && (
              <div className="quick-ai-summary-box">
                <div className="summary-header">
                  <span className="summary-icon">⚡</span>
                  <span className="summary-title">Quick AI Summary</span>
                  <span className="summary-badge">Key Takeaways</span>
                </div>
                <div className="summary-body">
                  <p>{article.summary}</p>
                </div>
              </div>
            )}

            {/* Mid-article ad */}
            <div className="article-ad-mid">
              <AdSlot type="rectangle" />
            </div>

            {/* Article body */}
            <ArticleBody body={article.body} slug={article.slug} />

            {/* Sources */}
            {article.sources && article.sources.length > 0 && (
              <aside className="article-sources">
                <h4 className="article-sources-heading">Sources</h4>
                <ul className="article-sources-list">
                  {article.sources.map((source, i) => (
                    <li key={i}>
                      {source.url ? (
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                          {source.source || source.title}
                        </a>
                      ) : (
                        <span>{source.source || source.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </aside>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="article-tags">
                {article.tags.map((tag) => (
                  <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`} className="article-tag">
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Share buttons */}
            <ShareButtons article={article} />
          </div>

          {/* Sidebar — sticky ad on desktop */}
          <aside className="article-sidebar" aria-label="Advertisement">
            <div className="article-sidebar-sticky">
              <AdSlot type="sidebar" />
            </div>
          </aside>
        </div>

        {/* Newsletter */}
        <NewsletterForm variant="bar" source="article" />
      </div>
    </>
  );
};

export default ArticlePage;
