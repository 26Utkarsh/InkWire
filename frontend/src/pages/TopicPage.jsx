/**
 * @fileoverview TopicPage.jsx — Articles filtered by topic for InkWire.
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTopicArticles } from '../hooks/useArticles.js';
import ArticleCard from '../components/article/ArticleCard.jsx';
import { ArticleCardSkeleton } from '../components/ui/Skeleton.jsx';
import { TOPICS } from '../constants/index.js';
import './TopicPage.css';

const TopicPage = () => {
  const { topicId } = useParams();
  const topic = TOPICS.find((t) => t.id === topicId);
  const { articles, loading, error } = useTopicArticles(topicId);

  if (!topic) {
    return (
      <div className="page-wrapper">
        <div className="container topic-not-found">
          <h1>Topic not found</h1>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{topic.label} News | InkWire</title>
        <meta name="description" content={`Latest ${topic.label} news from InkWire — AI-powered, editorially reviewed.`} />
        <link rel="canonical" href={`${window.location.origin}/topic/${topicId}`} />
      </Helmet>

      <div className="page-wrapper">
        <header className="topic-header container" style={{ '--topic-color': topic.color }}>
          <div className="topic-header-inner">
            <span className="topic-accent-line" style={{ background: topic.color }} />
            <h1 className="topic-title">{topic.label}</h1>
            <p className="topic-desc">Latest {topic.label} stories from InkWire</p>
          </div>
        </header>

        <section className="container topic-grid">
          <div className="grid-3 stagger-children">
            {loading
              ? Array.from({ length: 6 }, (_, i) => <ArticleCardSkeleton key={i} />)
              : articles.length > 0
                ? articles.map((a) => <ArticleCard key={a._id} article={a} />)
                : <p className="topic-empty">No articles in this topic yet. Check back soon.</p>
            }
          </div>
        </section>
      </div>
    </>
  );
};

export default TopicPage;
