import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

interface Link {
  id: number;
  originalUrl: string;
  shortCode: string;
  customAlias: string | null;
  clicksCount: number;
  createdAt: string;
  isActive: boolean;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await axios.get(`${API_URL}/links`);
      setLinks(response.data);
    } catch (err) {
      console.error('Failed to fetch links', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post(`${API_URL}/links`, {
        originalUrl,
        customAlias: customAlias || undefined,
      });
      setSuccess('Link created successfully!');
      setOriginalUrl('');
      setCustomAlias('');
      setShowForm(false);
      fetchLinks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create link');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;

    try {
      await axios.delete(`${API_URL}/links/${id}`);
      setSuccess('Link deleted successfully!');
      fetchLinks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete link');
    }
  };

  const copyToClipboard = (text: string) => {
    const shortUrl = `${window.location.origin}/${text}`;
    navigator.clipboard.writeText(shortUrl);
    setSuccess('Link copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <h1>🔗 Link Shortener</h1>
          <div className="user-info">
            <div>
              <div className="user-email">{user?.email}</div>
              <div className="user-plan">{user?.subscriptionLevel} Plan</div>
            </div>
            <button onClick={logout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Links</h3>
              <p className="stat-value">{links.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Clicks</h3>
              <p className="stat-value">
                {links.reduce((sum, link) => sum + link.clicksCount, 0)}
              </p>
            </div>
            <div className="stat-card">
              <h3>Active Links</h3>
              <p className="stat-value stat-success">
                {links.filter((l) => l.isActive).length}
              </p>
            </div>
          </div>

          <div className="links-section">
            <div className="section-header">
              <h2>Your Links</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary"
              >
                {showForm ? 'Cancel' : '+ Create New Link'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleCreateLink} className="create-form">
                <div className="form-group">
                  <label>Original URL *</label>
                  <input
                    type="url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    required
                    placeholder="https://example.com/your-long-url"
                  />
                </div>
                <div className="form-group">
                  <label>Custom Alias (Optional)</label>
                  <input
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    placeholder="my-custom-link"
                  />
                </div>
                <button type="submit" className="btn-success">
                  Create Link
                </button>
              </form>
            )}

            <div className="links-list">
              {links.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔗</div>
                  <h3>No links yet</h3>
                  <p>Create your first short link to get started!</p>
                </div>
              ) : (
                links.map((link) => (
                  <div key={link.id} className="link-card">
                    <div className="link-info">
                      <div className="link-short">
                        <code
                          onClick={() =>
                            copyToClipboard(link.customAlias || link.shortCode)
                          }
                        >
                          {window.location.origin}/
                          {link.customAlias || link.shortCode}
                        </code>
                        {link.customAlias && (
                          <span className="badge badge-custom">Custom</span>
                        )}
                      </div>
                      <div className="link-original">{link.originalUrl}</div>
                      <div className="link-meta">
                        <span>👆 {link.clicksCount} clicks</span>
                        <span>
                          📅 {new Date(link.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => navigate(`/analytics/${link.id}`)}
                          className="btn-link"
                        >
                          📊 Analytics
                        </button>
                      </div>
                    </div>
                    <div className="link-actions">
                      <button
                        onClick={() =>
                          copyToClipboard(link.customAlias || link.shortCode)
                        }
                        className="btn-secondary"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;