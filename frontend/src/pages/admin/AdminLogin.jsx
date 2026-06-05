/**
 * @fileoverview AdminLogin.jsx — Admin login page for InkWire dashboard.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../../config/api.js';
import useAppStore from '../../store/useAppStore.js';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setToken, isAuthenticated } = useAppStore();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/admin/dashboard');
    return null;
  }

  /**
   * Handle login form submission
   * @param {React.FormEvent} e
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      setToken(res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | InkWire</title>
      </Helmet>

      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h1 className="admin-login-logo">InkWire</h1>
            <p className="admin-login-subtitle">Editorial Dashboard</p>
          </div>

          <form className="admin-login-form" onSubmit={handleLogin} noValidate>
            <div className="admin-login-field">
              <label htmlFor="admin-email" className="admin-login-label">Email</label>
              <input
                id="admin-email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="admin-login-field">
              <label htmlFor="admin-password" className="admin-login-label">Password</label>
              <input
                id="admin-password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && <p className="admin-login-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary admin-login-btn"
              disabled={loading}
              id="admin-login-submit"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="admin-login-footer">
            InkWire Admin — Authorized access only
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
