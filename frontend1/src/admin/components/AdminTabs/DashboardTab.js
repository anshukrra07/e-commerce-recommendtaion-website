import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../utils/environment.js';

function DashboardTab() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/analytics/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-section">
        <h2>Platform Analytics Overview</h2>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="dashboard-section">
        <h2>Platform Analytics Overview</h2>
        <p>Unable to load analytics data.</p>
      </div>
    );
  }

  const platformAnalytics = analytics; // Use the fetched analytics
  return (
    <div className="dashboard-section">
      <h2>Platform Analytics Overview</h2>
      
      <div className="analytics-cards">
        <div className="analytics-card revenue">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-label">Total Revenue</div>
            <div className="card-value">₹{platformAnalytics.overview.totalRevenue > 0 ? (platformAnalytics.overview.totalRevenue / 100000).toFixed(2) : 0}L+</div>
            <div className="card-growth positive">↑ {platformAnalytics.overview.revenueGrowth}%</div>
          </div>
        </div>
        <div className="analytics-card orders">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <div className="card-label">Total Orders</div>
            <div className="card-value">{platformAnalytics.overview.totalOrders.toLocaleString()}</div>
            <div className="card-growth positive">↑ {platformAnalytics.overview.ordersGrowth}%</div>
          </div>
        </div>
        <div className="analytics-card users">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <div className="card-label">Total Users</div>
            <div className="card-value">{platformAnalytics.overview.totalUsers.toLocaleString()}</div>
            <div className="card-growth positive">↑ {platformAnalytics.overview.usersGrowth}%</div>
          </div>
        </div>
        <div className="analytics-card sellers">
          <div className="card-icon">🏪</div>
          <div className="card-content">
            <div className="card-label">Active Sellers</div>
            <div className="card-value">{platformAnalytics.overview.activeSellers}</div>
            <div className="card-growth positive">↑ {platformAnalytics.overview.sellersGrowth}%</div>
          </div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-section">
          <h3>📈 Monthly Revenue Trend</h3>
          <div className="revenue-chart">
            {platformAnalytics.monthlyRevenue && platformAnalytics.monthlyRevenue.length > 0 ? (
              platformAnalytics.monthlyRevenue.map((item, index) => (
                <div key={index} className="chart-bar-container">
                  <div className="chart-bar" style={{height: `${Math.max((item.revenue / 10000), 10)}px`}}>
                    <span className="bar-value">₹{(item.revenue / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="chart-label">{item.month}</div>
                </div>
              ))
            ) : (
              <p>No data available</p>
            )}
          </div>
        </div>

        <div className="chart-section">
          <h3>📅 Category Performance</h3>
          <div className="category-performance">
            {platformAnalytics.categoryPerformance && platformAnalytics.categoryPerformance.length > 0 ? (
              platformAnalytics.categoryPerformance.map((cat, index) => (
                <div key={index} className="category-row">
                  <div className="category-name">{cat.category}</div>
                  <div className="category-stats">
                    <span className="category-sales">₹{(cat.sales / 100000).toFixed(2)}L</span>
                    <span className="category-orders">{cat.orders} orders</span>
                    <span className={`category-growth ${cat.growth >= 0 ? 'positive' : 'negative'}`}>
                      {cat.growth >= 0 ? '↑' : '↓'} {Math.abs(cat.growth)}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p>No category data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Sales Performance Section */}
      <div className="analytics-section">
        <h3>💹 Sales Performance Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-box">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <div className="metric-label">Average Order Value</div>
              <div className="metric-value">₹{(platformAnalytics.overview.totalRevenue / platformAnalytics.overview.totalOrders).toFixed(0)}</div>
              <div className="metric-change positive">↑ 8.5% from last month</div>
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <div className="metric-label">Conversion Rate</div>
              <div className="metric-value">3.7%</div>
              <div className="metric-change positive">↑ 0.4% improvement</div>
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-icon">⚡</div>
            <div className="metric-content">
              <div className="metric-label">Daily Sales Average</div>
              <div className="metric-value">₹{((platformAnalytics.overview.totalRevenue / 30) / 1000).toFixed(1)}K</div>
              <div className="metric-change positive">↑ 12% this week</div>
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-icon">🔄</div>
            <div className="metric-content">
              <div className="metric-label">Return Rate</div>
              <div className="metric-value">2.3%</div>
              <div className="metric-change negative">↓ 0.8% improvement</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Levels Overview */}
      <div className="analytics-section">
        <h3>📦 Inventory & Stock Levels</h3>
        <div className="stock-overview-grid">
          <div className="stock-card total">
            <div className="stock-icon">📆</div>
            <div className="stock-info">
              <div className="stock-label">Total Products</div>
              <div className="stock-value">{platformAnalytics.stockMetrics?.totalProducts || 0}</div>
              <div className="stock-subtext">Active listings</div>
            </div>
          </div>
          <div className="stock-card in-stock">
            <div className="stock-icon">✅</div>
            <div className="stock-info">
              <div className="stock-label">In Stock</div>
              <div className="stock-value">{platformAnalytics.stockMetrics?.inStock || 0}</div>
              <div className="stock-percentage">
                {platformAnalytics.stockMetrics?.totalProducts > 0 ? 
                  ((platformAnalytics.stockMetrics.inStock / platformAnalytics.stockMetrics.totalProducts) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
          <div className="stock-card low-stock">
            <div className="stock-icon">⚠️</div>
            <div className="stock-info">
              <div className="stock-label">Low Stock</div>
              <div className="stock-value">{platformAnalytics.stockMetrics?.lowStock || 0}</div>
              <div className="stock-percentage">
                {platformAnalytics.stockMetrics?.totalProducts > 0 ? 
                  ((platformAnalytics.stockMetrics.lowStock / platformAnalytics.stockMetrics.totalProducts) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
          <div className="stock-card out-of-stock">
            <div className="stock-icon">❌</div>
            <div className="stock-info">
              <div className="stock-label">Out of Stock</div>
              <div className="stock-value">{platformAnalytics.stockMetrics?.outOfStock || 0}</div>
              <div className="stock-percentage">
                {platformAnalytics.stockMetrics?.totalProducts > 0 ? 
                  ((platformAnalytics.stockMetrics.outOfStock / platformAnalytics.stockMetrics.totalProducts) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Category Stock Levels */}
        <div className="category-stock-section">
          <h4>Products by Category</h4>
          <div className="category-stock-bars">
            {platformAnalytics.categoryPerformance && platformAnalytics.categoryPerformance.slice(0, 5).map((cat, index) => {
              const total = cat.products || 0;
              return (
              <div key={index} className="category-stock-row">
                <div className="category-stock-label">{cat.category}</div>
                <div className="category-stock-bar">
                  <div 
                    className="stock-segment in-stock" 
                    style={{width: '100%'}}
                    title={`Products: ${total}`}
                  >
                    {total} products
                  </div>
                </div>
                <div className="category-stock-total">{cat.orders} sold</div>
              </div>
            );
            })}
          </div>
        </div>
      </div>

      {/* Growth Trends */}
      <div className="analytics-section">
        <h3>📈 Growth Trends & Insights</h3>
        <div className="growth-trends-grid">
          <div className="trend-card">
            <div className="trend-header">
              <div className="trend-icon">🚀</div>
              <div className="trend-title">Revenue Growth</div>
            </div>
            <div className="trend-chart-mini">
              <div className="mini-bars">
                {[65, 72, 68, 78, 85, 92, 100].map((val, i) => (
                  <div key={i} className="mini-bar" style={{height: `${val}%`}}></div>
                ))}
              </div>
            </div>
            <div className="trend-stats">
              <div className="trend-value">+{platformAnalytics.overview.revenueGrowth}%</div>
              <div className="trend-period">Last 7 days</div>
            </div>
          </div>

          <div className="trend-card">
            <div className="trend-header">
              <div className="trend-icon">👥</div>
              <div className="trend-title">User Acquisition</div>
            </div>
            <div className="trend-chart-mini">
              <div className="mini-bars">
                {[58, 65, 72, 68, 75, 82, 88].map((val, i) => (
                  <div key={i} className="mini-bar" style={{height: `${val}%`}}></div>
                ))}
              </div>
            </div>
            <div className="trend-stats">
              <div className="trend-value">+{platformAnalytics.overview.usersGrowth}%</div>
              <div className="trend-period">Last 7 days</div>
            </div>
          </div>

          <div className="trend-card">
            <div className="trend-header">
              <div className="trend-icon">🛍️</div>
              <div className="trend-title">Order Volume</div>
            </div>
            <div className="trend-chart-mini">
              <div className="mini-bars">
                {[70, 68, 75, 82, 78, 85, 92].map((val, i) => (
                  <div key={i} className="mini-bar" style={{height: `${val}%`}}></div>
                ))}
              </div>
            </div>
            <div className="trend-stats">
              <div className="trend-value">+{platformAnalytics.overview.ordersGrowth}%</div>
              <div className="trend-period">Last 7 days</div>
            </div>
          </div>

          <div className="trend-card">
            <div className="trend-header">
              <div className="trend-icon">⭐</div>
              <div className="trend-title">Customer Satisfaction</div>
            </div>
            <div className="trend-chart-mini">
              <div className="mini-bars">
                {[88, 90, 89, 91, 92, 93, 95].map((val, i) => (
                  <div key={i} className="mini-bar" style={{height: `${val}%`}}></div>
                ))}
              </div>
            </div>
            <div className="trend-stats">
              <div className="trend-value">4.8/5.0</div>
              <div className="trend-period">+0.3 this month</div>
            </div>
          </div>
        </div>
      </div>

      <div className="top-sellers-section">
        <h3>🏆 Top Performing Sellers</h3>
        <div className="top-sellers-table">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Seller</th>
                <th>Revenue</th>
                <th>Orders</th>
                <th>Rating</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              {platformAnalytics.topSellers && platformAnalytics.topSellers.length > 0 ? (
                platformAnalytics.topSellers.map((seller, index) => (
                  <tr key={seller.id}>
                    <td><div className="rank-badge">#{index + 1}</div></td>
                    <td><strong>{seller.name}</strong></td>
                    <td>₹{(seller.revenue / 100000).toFixed(2)}L</td>
                    <td>{seller.orders.toLocaleString()}</td>
                    <td><span className="rating">⭐ {seller.rating}</span></td>
                    <td><span className="growth positive">↑ {seller.growth}%</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center'}}>No seller data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardTab;
