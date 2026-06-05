/**
 * @fileoverview Home.jsx — InkWire homepage.
 * FIXES:
 *   - Hero gracefully collapses when no featured article (pulls top story from grid instead)
 *   - Ad unit: hidden entirely when no real AdSense publisher ID configured
 *   - Secondary cards stack below hero on mobile (not hidden)
 *   - Image onError fallback on all thumbnails
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useArticles, useFeaturedArticle } from '../hooks/useArticles.js';
import FeaturedCard from '../components/article/FeaturedCard.jsx';
import ArticleCard from '../components/article/ArticleCard.jsx';
import { ArticleCardSkeleton, FeaturedSkeleton, SecondaryCardSkeleton } from '../components/ui/Skeleton.jsx';
import AdSlot from '../components/ui/AdSlot.jsx';
import NewsletterForm from '../components/ui/NewsletterForm.jsx';
import { makeImageErrorHandler } from '../utils/imageUtils.js';
import './Home.css';

/** Secondary article row — compact horizontal card */
const SecondaryCard = ({ article }) => (
  <a href={`/article/${article.slug}`} className="secondary-card">
    <div className="secondary-card-body">
      <span className={`badge badge-${article.topic}`}>
        {article.topic?.charAt(0).toUpperCase() + article.topic?.slice(1)}
      </span>
      <h3 className="secondary-card-headline">{article.headline}</h3>
    </div>
    {article.imageUrl && (
      <img
        src={article.imageUrl}
        alt=""
        className="secondary-card-thumb"
        loading="lazy"
        onError={makeImageErrorHandler(article.topic, article.slug)}
      />
    )}
  </a>
);

const Home = () => {
  const { featured, loading: featuredLoading } = useFeaturedArticle();
  const { articles, loading: articlesLoading } = useArticles();

  const secondary = articles.slice(0, 4);
  const grid = articles.slice(4);

  /**
   * When no pinned featured article exists, promote the first grid article.
   * This prevents the harsh blank-void empty state.
   */
  const displayFeatured = featured ?? (articles.length > 0 ? articles[0] : null);
  const displaySecondary = featured ? secondary : articles.slice(1, 5);
  const displayGrid = featured ? grid : articles.slice(5);
  const isLoading = featuredLoading || articlesLoading;

  return (
    <>
      <Helmet>
        <title>InkWire — The World's Most Important Stories</title>
        <meta name="description" content="InkWire delivers AI-powered, editorially reviewed news covering world events, India, technology, business, science, and politics." />
        <meta property="og:title" content="InkWire — The World's Most Important Stories" />
        <meta property="og:description" content="AI-powered, editorially reviewed global news." />
        <link rel="canonical" href={window.location.origin} />
      </Helmet>

      <div className="page-wrapper">

        {/* ── Leaderboard ad — only renders if publisher ID is set ── */}
        <div className="home-ad-strip">
          <div className="container">
            <AdSlot type="leaderboard" />
          </div>
        </div>

        {/* ── Hero: Featured + Secondary articles ── */}
        <section className="home-hero container" aria-label="Top stories">
          <div className="featured-layout">

            {/* Featured */}
            <div className="home-featured">
              {isLoading ? (
                <FeaturedSkeleton />
              ) : displayFeatured ? (
                <FeaturedCard article={displayFeatured} />
              ) : (
                /* Graceful empty: show skeleton shimmer with message — no blank void */
                <div className="home-empty-hero">
                  <div className="home-empty-pulse" />
                  <div className="home-empty-content">
                    <span className="home-empty-eyebrow">Coming Soon</span>
                    <p className="home-empty-headline">Today's top stories are being prepared by our AI editorial team.</p>
                    <p className="home-empty-sub">Check back after 5:00 AM. New articles publish three times daily.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Secondary sidebar — desktop: right column | mobile: below hero */}
            <aside className="home-secondary" aria-label="More top stories">
              {isLoading
                ? Array.from({ length: 4 }, (_, i) => <SecondaryCardSkeleton key={i} />)
                : displaySecondary.map((a) => <SecondaryCard key={a._id} article={a} />)
              }
            </aside>
          </div>
        </section>

        {/* ── Latest Stories section ── */}
        <section className="home-grid-section container" aria-label="Latest articles">
          <div className="section-header">
            <h2 className="section-title">Latest Stories</h2>
          </div>

          {/* Ad inside section — only shows if publisher ID configured */}
          <div className="home-ad-inline">
            <AdSlot type="rectangle" />
          </div>

          <div className="grid-3 stagger-children">
            {isLoading
              ? Array.from({ length: 6 }, (_, i) => <ArticleCardSkeleton key={i} />)
              : displayGrid.length > 0
                ? displayGrid.map((a) => <ArticleCard key={a._id} article={a} />)
                : !isLoading && (
                  <p className="home-grid-empty">
                    Articles will appear here once published. Generation runs at 5:00 AM daily.
                  </p>
                )
            }
          </div>
        </section>

        {/* Newsletter */}
        <NewsletterForm variant="bar" source="homepage" />
      </div>
    </>
  );
};

export default Home;
