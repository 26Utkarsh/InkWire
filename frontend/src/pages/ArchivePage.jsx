/**
 * @fileoverview ArchivePage.jsx — Browse articles by date for InkWire.
 * Features: automatic loading on date change, URL search query synchronization.
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { fetchArticlesByDate } from '../services/articleService.js';
import ArticleCard from '../components/article/ArticleCard.jsx';
import './SearchPage.css';

const ArchivePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlDate = searchParams.get('date');
  const defaultDate = urlDate && /^\d{4}-\d{2}-\d{2}$/.test(urlDate) 
    ? urlDate 
    : format(new Date(), 'yyyy-MM-dd');

  const [date, setDate] = useState(defaultDate);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLoad = async (targetDate) => {
    if (!targetDate) return;
    try {
      setLoading(true);
      const data = await fetchArticlesByDate(targetDate);
      setArticles(data.data || []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Sync state with URL search param
  useEffect(() => {
    const activeDate = urlDate && /^\d{4}-\d{2}-\d{2}$/.test(urlDate) ? urlDate : defaultDate;
    setDate(activeDate);
    handleLoad(activeDate);
  }, [urlDate]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    if (!newDate) return;
    setDate(newDate);
    setSearchParams({ date: newDate });
  };

  const getFormattedTitle = () => {
    if (!date) return '';
    try {
      const parsedDate = new Date(date + 'T00:00:00');
      if (isNaN(parsedDate.getTime())) return date;
      return format(parsedDate, 'MMMM d, yyyy');
    } catch {
      return date;
    }
  };

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
                onChange={handleDateChange}
                max={format(new Date(), 'yyyy-MM-dd')}
                id="archive-date-input"
              />
            </div>
          </header>

          <p className="search-count" style={{ minHeight: '24px' }}>
            {loading
              ? 'Loading...'
              : `${articles.length} article${articles.length !== 1 ? 's' : ''} on ${getFormattedTitle()}`
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
