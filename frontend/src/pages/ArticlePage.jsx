/**
 * @fileoverview ArticlePage.jsx — Full article reading page for InkWire.
 * Redesigned to match BBC News editorial layout and typography.
 */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { format, formatDistanceToNow } from 'date-fns';
import { useQuery } from '../hooks/useArticleDetail.js';
import ArticleBody from '../components/article/ArticleBody.jsx';
import AdSlot from '../components/ui/AdSlot.jsx';
import BookmarkButton from '../components/ui/BookmarkButton.jsx';
import NewsletterForm from '../components/ui/NewsletterForm.jsx';
import useAppStore from '../store/useAppStore.js';
import './ArticlePage.css';

const ArticlePage = () => {
  const { slug } = useParams();
  const { article, loading, error } = useQuery(slug);
  const [copied, setCopied] = useState(false);
  const addToast = useAppStore((s) => s.addToast);

  if (loading) {
    return (
      <div className="page-wrapper article-page-loading">
        <div className="container">
          <div className="skeleton" style={{ height: '500px', borderRadius: '4px' }} />
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

  // Split summary into sentences for the BBC-style "At a glance" key bullet points
  const summaryBullets = article.summary
    ? article.summary.split(/(?<=[.?!])\s+/).filter(Boolean)
    : [];

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
            {/* BBC Style Article Header */}
            <header className="article-header-bbc">
              <h1 className="article-headline-bbc">{article.headline}</h1>
              {article.subheadline && (
                <p className="article-subheadline-bbc">{article.subheadline}</p>
              )}

              {/* BBC Style Metabar */}
              <div className="article-metabar-bbc">
                <div className="metabar-left-bbc">
                  {article.publishedAt && (
                    <time className="article-time-bbc" dateTime={article.publishedAt}>
                      {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true }).replace('about ', '')}
                    </time>
                  )}
                </div>

                <div className="metabar-right-bbc">
                  <div className="bbc-action-buttons">
                    <button className="bbc-action-btn share-trigger" onClick={copyLink} aria-label="Copy Link">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}>
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                      {copied ? 'Copied' : 'Share'}
                    </button>
                    
                    <BookmarkButton article={article} variant="pill" />

                    <button className="bbc-action-btn google-trigger" onClick={() => window.open('https://news.google.com')} aria-label="Google News">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px', color: '#4285F4' }}>
                        <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 2.185 15.427 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c6.34 0 10.556-4.437 10.556-10.75 0-.724-.078-1.275-.173-1.825H12.24z"/>
                      </svg>
                      Add as preferred on Google
                    </button>
                  </div>
                </div>
              </div>

              {/* Byline */}
              <div className="article-byline-bbc">
                <span className="byline-name-bbc">{article.byline || 'InkWire Editorial Desk'}</span>
                {article.topic && (
                  <span className="byline-role-bbc">
                    InkWire {article.topic.charAt(0).toUpperCase() + article.topic.slice(1)} Editor
                  </span>
                )}
              </div>
            </header>

            {/* Article image */}
            {article.imageUrl && (
              <figure className="article-figure-bbc">
                <img
                  src={article.imageUrl}
                  alt={article.headline}
                  className="article-hero-image-bbc"
                />
                {article.imageCredit && (
                  <figcaption className="article-image-credit-bbc">{article.imageCredit}</figcaption>
                )}
              </figure>
            )}

            {/* BBC-style "At a glance" takeaways */}
            {summaryBullets.length > 0 && (
              <div className="bbc-at-a-glance">
                <h3 className="at-a-glance-title">At a glance</h3>
                <ul className="at-a-glance-list">
                  {summaryBullets.map((bullet, idx) => (
                    <li key={idx} className="at-a-glance-item">{bullet.trim()}</li>
                  ))}
                </ul>
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
              <aside className="article-sources-bbc">
                <h4 className="article-sources-heading-bbc">Sources</h4>
                <ul className="article-sources-list-bbc">
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
              <div className="article-tags-bbc">
                {article.tags.map((tag) => (
                  <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`} className="article-tag-bbc">
                    {tag}
                  </Link>
                ))}
              </div>
            )}
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
