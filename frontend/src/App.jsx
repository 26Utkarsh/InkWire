/**
 * @fileoverview App.jsx — Router setup and page composition for InkWire frontend.
 */

import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import Toast from './components/ui/Toast.jsx';

// Public pages
import Home from './pages/Home.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import TopicPage from './pages/TopicPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';

// Admin pages — all lazy loaded (don't affect public bundle)
const AdminLogin     = React.lazy(() => import('./pages/admin/AdminLogin.jsx'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const ArticleQueue   = React.lazy(() => import('./pages/admin/ArticleQueue.jsx'));
const ArticleEditor  = React.lazy(() => import('./pages/admin/ArticleEditor.jsx'));
const AdminSettings  = React.lazy(() => import('./pages/admin/AdminSettings.jsx'));

/** Published and Archive pages — lazy loaded */
const ArchivePage = React.lazy(() => import('./pages/ArchivePage.jsx'));
const Published   = React.lazy(() => import('./pages/admin/Published.jsx'));

/** Loading fallback */
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <div className="spinner" />
  </div>
);

/** Public layout with Navbar + Footer */
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

const App = () => (
  <HelmetProvider>
    <BrowserRouter>
      <Toast />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/article/:slug" element={<PublicLayout><ArticlePage /></PublicLayout>} />
          <Route path="/topic/:topicId" element={<PublicLayout><TopicPage /></PublicLayout>} />
          <Route path="/search" element={<PublicLayout><SearchPage /></PublicLayout>} />
          <Route path="/archive" element={<PublicLayout><Suspense fallback={<PageLoader />}><ArchivePage /></Suspense></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/privacy-policy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
          <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />

          <Route path="/admin/login"     element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />
          <Route path="/admin/dashboard" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
          <Route path="/admin/queue"     element={<Suspense fallback={<PageLoader />}><ArticleQueue /></Suspense>} />
          <Route path="/admin/editor/:id" element={<Suspense fallback={<PageLoader />}><ArticleEditor /></Suspense>} />
          <Route path="/admin/published" element={<Suspense fallback={<PageLoader />}><Published /></Suspense>} />
          <Route path="/admin/settings" element={<Suspense fallback={<PageLoader />}><AdminSettings /></Suspense>} />

          {/* Redirects */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<PublicLayout><Navigate to="/" replace /></PublicLayout>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </HelmetProvider>
);

export default App;
