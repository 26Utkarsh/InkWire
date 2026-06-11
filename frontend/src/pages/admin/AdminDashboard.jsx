/**
 * @fileoverview AdminDashboard.jsx — Stats overview for InkWire admin.
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAdminStats } from '../../hooks/useAdmin.js';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import { triggerGeneration, sendNewsletter, triggerPublish, generateCustomArticle, wikiSearch, wikiImport, getSuggestedHeadlines } from '../../services/adminService.js';
import useAppStore from '../../store/useAppStore.js';
import './AdminDashboard.css';

/** Stat card subcomponent */
const StatCard = ({ icon, label, value, sublabel }) => (
  <div className="stat-card">
    <span className="stat-icon">{icon}</span>
    <div className="stat-body">
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {sublabel && <div className="stat-sublabel">{sublabel}</div>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const { stats, loading } = useAdminStats();
  const addToast = useAppStore((s) => s.addToast);
  const [time, setTime] = useState(new Date());

  // Custom AI article form states
  const [customTopic, setCustomTopic] = useState('');
  const [customCategory, setCustomCategory] = useState('india');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customImageUrl2, setCustomImageUrl2] = useState('');
  const [customImageCredit, setCustomImageCredit] = useState('');
  const [generatingCustom, setGeneratingCustom] = useState(false);

  // Wikipedia Import states
  const [activeTab, setActiveTab] = useState('prompt'); // 'prompt' | 'wiki'
  const [wikiQuery, setWikiQuery] = useState('');
  const [wikiResults, setWikiResults] = useState([]);
  const [searchingWiki, setSearchingWiki] = useState(false);
  const [importingWiki, setImportingWiki] = useState(false);
  const [wikiCategory, setWikiCategory] = useState('india');
  const [selectedWiki, setSelectedWiki] = useState(null);

  // News Suggestions states
  const [newsSuggestions, setNewsSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const res = await getSuggestedHeadlines();
      setNewsSuggestions(res.data || []);
    } catch (err) {
      console.warn('Failed to load news suggestions', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const handleGenerate = async () => {
    try {
      await triggerGeneration();
      addToast('Generation started! Articles will appear in queue in ~2 minutes.', 'success');
    } catch {
      addToast('Failed to trigger generation', 'error');
    }
  };

  const handleNewsletter = async () => {
    try {
      await sendNewsletter();
      addToast('Newsletter sending in background.', 'success');
    } catch {
      addToast('Failed to send newsletter', 'error');
    }
  };

  const handlePublishSlot = async (slot) => {
    try {
      await triggerPublish(slot);
      addToast(`🚀 Publishing triggered for ${slot} slot!`, 'success');
    } catch {
      addToast(`Failed to publish ${slot} slot`, 'error');
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          setCustomImageUrl(event.target.result);
          setCustomImageCredit('Pasted from clipboard');
          addToast('📸 Image pasted from clipboard!', 'success');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCustomGenerate = async (e) => {
    e.preventDefault();
    if (!customTopic.trim()) {
      addToast('Please enter a topic description', 'error');
      return;
    }

    try {
      setGeneratingCustom(true);
      await generateCustomArticle({
        prompt: customTopic,
        topic: customCategory,
        imageUrl: customImageUrl,
        imageCredit: customImageCredit,
        imageUrl2: customImageUrl2
      });
      addToast('✨ Custom article generated successfully! Added to Review Queue.', 'success');
      setCustomTopic('');
      setCustomImageUrl('');
      setCustomImageUrl2('');
      setCustomImageCredit('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to generate custom article';
      addToast(errorMsg, 'error');
    } finally {
      setGeneratingCustom(false);
    }
  };

  const handleSelectAndGenerate = async (item) => {
    try {
      setGeneratingCustom(true);
      setCustomTopic(item.title);
      setCustomCategory(item.topic || 'india');
      setCustomImageUrl('');
      setCustomImageCredit('');

      await generateCustomArticle({
        prompt: item.title,
        topic: item.topic || 'india',
        imageUrl: '',
        imageCredit: ''
      });
      addToast('✨ Custom article generated successfully! Added to Review Queue.', 'success');
      setCustomTopic('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to generate custom article';
      addToast(errorMsg, 'error');
    } finally {
      setGeneratingCustom(false);
    }
  };

  const handleWikiSearch = async (e) => {
    e.preventDefault();
    if (!wikiQuery.trim()) return;

    try {
      setSearchingWiki(true);
      setSelectedWiki(null);

      let res;
      try {
        res = await wikiSearch(wikiQuery.trim());
      } catch (backendErr) {
        console.warn('Backend Wikipedia search failed, attempting direct client-side fetch...', backendErr);
        const directRes = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(wikiQuery.trim())}&limit=10&format=json&origin=*`);
        const data = await directRes.json();
        const [, titles, descriptions, urls] = data;
        res = {
          data: (titles || []).map((title, i) => ({
            title,
            description: descriptions?.[i] || '',
            url: urls?.[i] || '',
          }))
        };
      }

      setWikiResults(res.data || []);
      if (res.data?.length === 0) {
        addToast('No Wikipedia articles found', 'warning');
      }
    } catch {
      addToast('Failed to search Wikipedia', 'error');
    } finally {
      setSearchingWiki(false);
    }
  };

  const handleWikiImport = async (title) => {
    try {
      setImportingWiki(true);
      await wikiImport({ title, topic: wikiCategory });
      addToast(`🌐 "${title}" imported and rewritten successfully!`, 'success');
      setWikiQuery('');
      setWikiResults([]);
      setSelectedWiki(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to import Wikipedia article';
      addToast(errorMsg, 'error');
    } finally {
      setImportingWiki(false);
    }
  };

  return (
    <AdminLayout>
      <Helmet><title>Dashboard | InkWire Admin</title></Helmet>

      <div className="admin-page">
        <header className="admin-page-hero">
          <div className="hero-welcome">
            <h1 className="admin-page-title">Editorial Control Room</h1>
            <p className="admin-page-subtitle">Welcome back. Here is the publication overview and scheduler status for today.</p>
          </div>
          
          <div className="live-widgets">
            <div className="live-clock-widget">
              <span className="live-pulse"></span>
              <span className="clock-time">{formattedTime}</span>
              <span className="clock-tz">IST</span>
            </div>
            <div className="admin-header-actions">
              <button className="btn btn-primary" onClick={handleGenerate} id="btn-generate-now">
                ⚡ Generate Now
              </button>
              <button className="btn btn-secondary" onClick={handleNewsletter} id="btn-send-newsletter">
                📧 Send Newsletter
              </button>
            </div>
          </div>
        </header>

        {/* Today's stats */}
        <section className="dashboard-section animate-fade-in">
          <h2 className="dashboard-section-title">Today</h2>
          <div className="stats-grid">
            <StatCard icon="✅" label="Articles approved" value={loading ? '…' : stats?.today?.approved} />
            <StatCard icon="❌" label="Articles rejected" value={loading ? '…' : stats?.today?.rejected} />
            <StatCard icon="⏳" label="Awaiting review" value={loading ? '…' : stats?.today?.pending} />
            <StatCard icon="👁️" label="Total views today" value={loading ? '…' : stats?.today?.views?.toLocaleString()} />
          </div>
        </section>

        {/* Weekly stats */}
        <section className="dashboard-section animate-fade-in delay-1">
          <h2 className="dashboard-section-title">This Week</h2>
          <div className="stats-grid">
            <StatCard icon="📰" label="Articles published" value={loading ? '…' : stats?.week?.published} />
            <StatCard icon="📧" label="Newsletter subscribers" value={loading ? '…' : stats?.subscribers?.toLocaleString()} sublabel="Active subscribers" />
            {stats?.topArticle && (
              <StatCard
                icon="🏆"
                label="Top article"
                value={`${stats.topArticle.views?.toLocaleString()} views`}
                sublabel={stats.topArticle.headline}
              />
            )}
          </div>
        </section>

        {/* Quick actions portal */}
        <section className="dashboard-section animate-fade-in delay-2">
          <h2 className="dashboard-section-title">Quick Actions Portal</h2>
          <div className="quick-actions-grid">
            <a href="/admin/queue" className="quick-action-card">
              <div className="action-card-icon">📋</div>
              <div className="action-card-content">
                <h3>Review Queue</h3>
                <p>Approve or reject AI drafts.</p>
                {stats?.today?.pending > 0 && (
                  <span className="action-badge pending-badge">{stats.today.pending} pending</span>
                )}
              </div>
              <div className="action-card-arrow">→</div>
            </a>
            <a href="/admin/published" className="quick-action-card">
              <div className="action-card-icon">📰</div>
              <div className="action-card-content">
                <h3>Published Articles</h3>
                <p>Manage live content and feature stories.</p>
              </div>
              <div className="action-card-arrow">→</div>
            </a>
            <a href="/" target="_blank" rel="noopener noreferrer" className="quick-action-card">
              <div className="action-card-icon">🌐</div>
              <div className="action-card-content">
                <h3>Visit Live Site</h3>
                <p>Open the public portal in a new tab.</p>
              </div>
              <div className="action-card-arrow">→</div>
            </a>
          </div>
        </section>

        {/* Custom AI Article Generator (Premium Card) */}
        <section className="dashboard-section animate-fade-in delay-3">
          <h2 className="dashboard-section-title">⚡ Generate Custom Article via AI</h2>
          <div className="custom-gen-card">
            <div className="admin-tabs-nav">
              <button 
                className={`tab-nav-btn ${activeTab === 'prompt' ? 'active' : ''}`}
                onClick={() => setActiveTab('prompt')}
                type="button"
              >
                ⚡ AI Prompt Mode
              </button>
              <button 
                className={`tab-nav-btn ${activeTab === 'wiki' ? 'active' : ''}`}
                onClick={() => setActiveTab('wiki')}
                type="button"
              >
                🌐 Wikipedia Import Mode
              </button>
            </div>

            {activeTab === 'prompt' ? (
              <form onSubmit={handleCustomGenerate} className="custom-gen-form">
                <div className="form-group">
                  <label htmlFor="custom-topic" className="form-label">Topic Description / Instructions</label>
                  <textarea
                    id="custom-topic"
                    className="form-control form-textarea"
                    placeholder="Describe the topic in detail (e.g. 'Rahul Gandhi visiting Andaman islands and showing us the risks of cutting down 1.5 crore trees and serious threat to coral reefs by the Great Nicobar project')..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    onPaste={handlePaste}
                    rows="4"
                    required
                  />
                </div>

                {loadingSuggestions ? (
                  <div className="suggestions-loading">
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ marginRight: '8px' }}></span>
                    Loading trending headlines...
                  </div>
                ) : (
                  newsSuggestions.length > 0 && (
                    <div className="form-group">
                      <label className="form-label suggestions-label">💡 Suggested Topics from Latest News</label>
                      <div className="suggestions-container">
                        {newsSuggestions.map((item, i) => (
                          <button
                            key={i}
                            type="button"
                            className="suggestion-pill"
                            onClick={() => handleSelectAndGenerate(item)}
                          >
                            <span className="suggestion-pill-source">[{item.source}]</span> {item.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label htmlFor="custom-category" className="form-label">Category</label>
                    <select
                      id="custom-category"
                      className="form-control form-select"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    >
                      <option value="india">India</option>
                      <option value="world">World</option>
                      <option value="politics">Politics</option>
                      <option value="business">Business</option>
                      <option value="technology">Technology</option>
                      <option value="science">Science</option>
                    </select>
                  </div>

                  {/* Headline Image */}
                  <div className="form-group flex-2" style={{ flex: 1, minWidth: '250px' }}>
                    <div className="image-input-header">
                      <label htmlFor="custom-image-url" className="form-label">Main Image (Optional)</label>
                      <label htmlFor="gallery-upload" className="gallery-upload-btn">
                        📁 Choose main Image
                      </label>
                      <input
                        type="file"
                        id="gallery-upload"
                        accept="image/*"
                        className="visually-hidden-input"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setCustomImageUrl(event.target.result);
                            setCustomImageCredit('Uploaded from device');
                            addToast('📁 Main image loaded!', 'success');
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      id="custom-image-url"
                      className="form-control"
                      placeholder="Main image URL or paste here..."
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                    />
                    {customImageUrl && (
                      <div className="pasted-image-preview-container">
                        <img 
                          src={customImageUrl} 
                          alt="Preview" 
                          className="pasted-image-preview" 
                        />
                        <button 
                          type="button" 
                          className="btn-remove-pasted-image"
                          onClick={() => {
                            setCustomImageUrl('');
                            setCustomImageCredit('');
                          }}
                        >
                          ✕ Remove Image
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Second Image (Inline Body Image) */}
                  <div className="form-group flex-2" style={{ flex: 1, minWidth: '250px' }}>
                    <div className="image-input-header">
                      <label htmlFor="custom-image-url-2" className="form-label">Second Image (Optional)</label>
                      <label htmlFor="gallery-upload-2" className="gallery-upload-btn">
                        📁 Choose second Image
                      </label>
                      <input
                        type="file"
                        id="gallery-upload-2"
                        accept="image/*"
                        className="visually-hidden-input"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setCustomImageUrl2(event.target.result);
                            addToast('📁 Second image loaded!', 'success');
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      id="custom-image-url-2"
                      className="form-control"
                      placeholder="Second image URL or paste here..."
                      value={customImageUrl2}
                      onChange={(e) => setCustomImageUrl2(e.target.value)}
                    />
                    {customImageUrl2 && (
                      <div className="pasted-image-preview-container">
                        <img 
                          src={customImageUrl2} 
                          alt="Preview" 
                          className="pasted-image-preview" 
                        />
                        <button 
                          type="button" 
                          className="btn-remove-pasted-image"
                          onClick={() => setCustomImageUrl2('')}
                        >
                          ✕ Remove Image
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-group flex-1">
                    <label htmlFor="custom-image-credit" className="form-label">Image Credit (Optional)</label>
                    <input
                      type="text"
                      id="custom-image-credit"
                      className="form-control"
                      placeholder="Photo via Rahul Gandhi on X"
                      value={customImageCredit}
                      onChange={(e) => setCustomImageCredit(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-submit-gen"
                  disabled={generatingCustom}
                >
                  {generatingCustom ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ marginRight: '8px' }}></span>
                      Generating Draft...
                    </>
                  ) : (
                    '⚡ Write & Add Draft to Queue'
                  )}
                </button>
              </form>
            ) : (
              <div className="wiki-import-container">
                <form onSubmit={handleWikiSearch} className="wiki-search-form">
                  <div className="form-group">
                    <label htmlFor="wiki-search-query" className="form-label">Search Wikipedia</label>
                    <div className="input-group-search">
                      <input
                        type="text"
                        id="wiki-search-query"
                        className="form-control"
                        placeholder="Search for a topic or article on Wikipedia..."
                        value={wikiQuery}
                        onChange={(e) => setWikiQuery(e.target.value)}
                        required
                      />
                      <button
                        type="submit"
                        className="btn btn-primary btn-search"
                        disabled={searchingWiki}
                      >
                        {searchingWiki ? 'Searching...' : '🔍 Search'}
                      </button>
                    </div>
                  </div>
                </form>

                {wikiResults.length > 0 && (
                  <div className="wiki-results-section">
                    <div className="wiki-results-grid">
                      <div className="wiki-list-panel">
                        <h4 className="panel-title-sm">Search Results</h4>
                        <div className="wiki-list">
                          {wikiResults.map((item, i) => (
                            <div
                              key={i}
                              className={`wiki-list-item ${selectedWiki?.title === item.title ? 'selected' : ''}`}
                              onClick={() => setSelectedWiki(item)}
                            >
                              <div className="wiki-item-title">{item.title}</div>
                              <div className="wiki-item-desc">{item.description || 'No description available'}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="wiki-preview-panel">
                        {selectedWiki ? (
                          <div className="wiki-preview-card">
                            <h4 className="preview-title">{selectedWiki.title}</h4>
                            <p className="preview-desc">{selectedWiki.description}</p>
                            <a
                              href={selectedWiki.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="wiki-external-link"
                            >
                              View on Wikipedia ↗
                            </a>

                            <div className="wiki-import-controls">
                              <div className="form-group">
                                <label htmlFor="wiki-import-category" className="form-label">Category</label>
                                <select
                                  id="wiki-import-category"
                                  className="form-control form-select"
                                  value={wikiCategory}
                                  onChange={(e) => setWikiCategory(e.target.value)}
                                >
                                  <option value="india">India</option>
                                  <option value="world">World</option>
                                  <option value="politics">Politics</option>
                                  <option value="business">Business</option>
                                  <option value="technology">Technology</option>
                                  <option value="science">Science</option>
                                </select>
                              </div>

                              <button
                                type="button"
                                className="btn btn-primary btn-wiki-import-submit"
                                onClick={() => handleWikiImport(selectedWiki.title)}
                                disabled={importingWiki}
                              >
                                {importingWiki ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ marginRight: '8px' }}></span>
                                    AI is writing article...
                                  </>
                                ) : (
                                  '🌐 Import & Rewrite via AI'
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="wiki-preview-placeholder">
                            Select an article from search results to preview and import
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Manual Publishing Overrides (Premium Control Center) */}
        <section className="dashboard-section control-center-panel animate-fade-in delay-4">
          <h2 className="dashboard-section-title control-center-title">🚀 Manual Publishing Console</h2>
          <p className="control-center-desc">
            Normally, articles approved in the queue will publish automatically at their scheduled times (8 AM, 1 PM, or 7 PM IST). Use these buttons to force-publish all approved articles in a specific slot instantly:
          </p>
          <div className="control-center-actions">
            <button className="btn btn-publish" onClick={() => handlePublishSlot('morning')} id="btn-publish-morning">🌅 Publish Morning</button>
            <button className="btn btn-publish" onClick={() => handlePublishSlot('afternoon')} id="btn-publish-afternoon">☀️ Publish Afternoon</button>
            <button className="btn btn-publish" onClick={() => handlePublishSlot('evening')} id="btn-publish-evening">🌆 Publish Evening</button>
          </div>
          <div className="system-health-divider"></div>
          <div className="system-health-grid">
            <div className="health-item">
              <span className="status-dot online-pulse"></span>
              <span className="health-label">AI Writer Model:</span>
              <span className="health-val">Gemini 2.5 Flash</span>
            </div>
            <div className="health-item">
              <span className="status-dot online-pulse"></span>
              <span className="health-label">Database Sync:</span>
              <span className="health-val">MongoDB Atlas</span>
            </div>
            <div className="health-item">
              <span className="status-dot online-pulse"></span>
              <span className="health-label">Newsletter Dispatcher:</span>
              <span className="health-val">Nodemailer Active</span>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
