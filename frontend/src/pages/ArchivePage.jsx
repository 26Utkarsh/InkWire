/**
 * @fileoverview ArchivePage.jsx — Browse articles by date for InkWire.
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { fetchArticlesByDate } from '../services/articleService.js';
import ArticleCard from '../components/article/ArticleCard.jsx';
import './SearchPage.css';

const ArchivePage = () => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLoad = async () => {
    try {
      setLoading(true);
      const data = await fetchArticlesByDate(date);
      setArticles(data.data || []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { handleLoad(); }, []);

  return (
    <>
      <Helmet>
        <title>Archive | InkWire</title>
        <meta name="description" content="Browse InkWire articles by date." />
      </Helmet>

      <div className="page-wrapper">
        <div className="container search-page">
          <header className="search-header">
            <h1 className="search-title">Archive</h1>
            <div className="search-form" style={{ maxWidth: '400px' }}>
              <input
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                id="archive-date-input"
              />
              <button className="btn btn-primary" onClick={handleLoad} id="archive-load-btn">
                Load
              </button>
            </div>
          </header>

          <p className="search-count">
            {loading
              ? 'Loading...'
              : `${articles.length} article${articles.length !== 1 ? 's' : ''} on ${format(new Date(date + 'T00:00:00'), 'MMMM d, yyyy')}`
            }
          </p>

          {!loading && articles.length > 0 && (
            <div className="grid-3 stagger-children">
              {articles.map((a) => <ArticleCard key={a._id} article={a} />)}
            </div>
          )}

          {!loading && articles.length === 0 && (
            <div className="search-empty">
              <p>No articles published on this date.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ArchivePage;
