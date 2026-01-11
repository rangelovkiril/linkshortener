import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell} from 'recharts';
import './Analytics.css';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

interface AnalyticsData {
  link: {
    id: number;
    shortCode: string;
    customAlias: string | null;
    originalUrl: string;
    totalClicks: number;
    createdAt: string;
  };
  analytics: {
    totalClicks: number;
    clicksByDate: Record<string, number>;
    topReferrers: Array<{ referer: string; count: number }>;
    browserStats: Array<{ browser: string; count: number }>;
    recentClicks: Array<{
      id: number;
      clickedAt: string;
      referer: string;
      userAgent: string;
    }>;
  };
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Analytics: React.FC = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [linkId, days]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics/link/${linkId}?days=${days}`);
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (error || !data) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || 'Failed to load analytics'}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Prepare chart data
  const clicksChartData = Object.entries(data.analytics.clicksByDate).map(
    ([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clicks: count,
    })
  );

  return (
    <div className="analytics">
      <header className="analytics-header">
        <div className="container">
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ← Back
          </button>
          <h1>Link Analytics</h1>
          <div className="user-email">{user?.email}</div>
        </div>
      </header>

      <main className="analytics-main">
        <div className="container">
          <div className="link-summary">
            <div className="summary-info">
              <h2>
                <code>
                  {window.location.origin}/{data.link.customAlias || data.link.shortCode}
                </code>
              </h2>
              <p className="original-url">{data.link.originalUrl}</p>
              <div className="summary-meta">
                <span>Created: {new Date(data.link.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="summary-stats">
              <div className="stat-large">
                <div className="stat-value">{data.link.totalClicks}</div>
                <div className="stat-label">Total Clicks</div>
              </div>
            </div>
          </div>

          <div className="time-range">
            <label>Time Range:</label>
            <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          <div className="analytics-grid">
            <div className="chart-card">
              <h3>Clicks Over Time</h3>
              {clicksChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={clicksChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="clicks" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">No click data available</div>
              )}
            </div>

            <div className="chart-card">
              <h3>Browser Distribution</h3>
              {data.analytics.browserStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.analytics.browserStats}
                      dataKey="count"
                      nameKey="browser"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.analytics.browserStats.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">No browser data available</div>
              )}
            </div>

            <div className="table-card">
              <h3>Top Referrers</h3>
              {data.analytics.topReferrers.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Referrer</th>
                      <th>Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.analytics.topReferrers.map((ref, index) => (
                      <tr key={index}>
                        <td className="referrer-cell">
                          {ref.referer === 'Direct' ? (
                            <span className="badge badge-direct">Direct</span>
                          ) : (
                            ref.referer
                          )}
                        </td>
                        <td>{ref.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-table">No referrer data available</div>
              )}
            </div>

            <div className="table-card">
              <h3>Recent Clicks</h3>
              {data.analytics.recentClicks.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Referrer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.analytics.recentClicks.map((click) => (
                      <tr key={click.id}>
                        <td>{new Date(click.clickedAt).toLocaleString()}</td>
                        <td className="referrer-cell">
                          {click.referer || 'Direct'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-table">No recent clicks</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;