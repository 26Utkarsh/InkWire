/**
 * @fileoverview SearchPage.jsx — Article search results page for InkWire.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSearch } from '../hooks/useSearch.js';
import ArticleCard from '../components/article/ArticleCard.jsx';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const { results, loading } = useSearch(query);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      setSearchParams({ q: query.trim() });
    }
  };

  return (
    <>
      <Helmet>
        <title>{query ? `Search: "${query}"` : 'Search'} | InkWire</title>
        <meta name="description" content={`Search results for "${query}" on InkWire`} />
      </Helmet>

      <div className="page-wrapper">
        <div className="container search-page">
          <header className="search-header">
            <h1 className="search-title">Search</h1>
            <form className="search-form" onSubmit={handleSearch}>
              <input
                id="search-input"
                className="input search-input"
                type="search"
                placeholder="Search articles..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search articles"
                autoFocus
              />
              <button type="submit" className="btn btn-primary" id="search-submit-btn">Search</button>
            </form>
          </header>

          {query && (
            <div className="search-results">
              <p className="search-count">
                {loading
                  ? 'Searching...'
                  : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`
                }
              </p>
              {!loading && results.length > 0 && (
                <div className="grid-3 stagger-children">
                  {results.map((a) => <ArticleCard key={a._id} article={a} />)}
                </div>
              )}
              {!loading && results.length === 0 && query.length >= 2 && (
                <div className="search-empty">
                  <p>No articles found for "{query}".</p>
                  <p>Try different keywords or browse by topic.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchPage;
