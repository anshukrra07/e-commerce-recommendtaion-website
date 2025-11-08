import React from 'react';

/**
 * AnalyticsTab Component
 * Shows seller analytics including revenue trends and customer metrics
 * Props:
 * - myProducts: array of seller's products
 * - analytics: object with various metrics from API
 * - loading: boolean loading state
 */
function AnalyticsTab({ myProducts, analytics, loading }) {
  // Use monthly revenue from analytics API
  const monthlyRevenue = analytics.monthlyRevenue || [];

  // Top 5 products by sales
  const topProducts = myProducts
    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="analytics-tab">
        <h2>📈 Sales Analytics</h2>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-tab">
      <h2>📈 Sales Analytics</h2>

      {/* Revenue Trend Chart */}
      <div className="analytics-section">
        <h3>Monthly Revenue Trend</h3>
        {monthlyRevenue.length > 0 ? (
          <div className="revenue-chart">
            {monthlyRevenue.map((item, index) => (
              <div key={index} className="chart-bar-container">
                <div 
                  className="chart-bar" 
                  style={{ height: `${Math.max((item.revenue / 2000), 10)}px` }}
                >
                  <span className="bar-value">₹{(item.revenue / 1000).toFixed(0)}K</span>
                </div>
                <div className="chart-label">{item.month}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No revenue data available yet. Start selling products!</p>
        )}
      </div>

      {/* Top Products */}
      <div className="analytics-section">
        <h3>🏆 Top 5 Best Selling Products</h3>
        {topProducts.length > 0 ? (
          <div className="top-products-list">
            {topProducts.map((product, index) => (
              <div key={product.id} className="top-product-item">
                <div className="product-rank">#{index + 1}</div>
                <div className="product-icon">{product.image}</div>
                <div className="product-details">
                  <div className="product-name">{product.name}</div>
                  <div className="product-stats">
                    <span className="stat">{product.sold} sold</span>
                    <span className="stat">₹{((product.revenue || 0) / 1000).toFixed(1)}K revenue</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No sales data available yet.</p>
        )}
      </div>

      {/* Product Performance Metrics */}
      <div className="analytics-section">
        <h3>📊 Product Performance</h3>
        <div className="customer-metrics">
          <div className="metric-box">
            <div className="metric-icon">📦</div>
            <div className="metric-content">
              <div className="metric-value">{myProducts.length}</div>
              <div className="metric-label">Total Products</div>
              <div className="metric-subtext">Listed</div>
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-icon">✅</div>
            <div className="metric-content">
              <div className="metric-value">{myProducts.filter(p => p.status === 'approved').length}</div>
              <div className="metric-label">Approved Products</div>
              <div className="metric-subtext">Live on store</div>
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-icon">⏳</div>
            <div className="metric-content">
              <div className="metric-value">{myProducts.filter(p => p.status === 'pending').length}</div>
              <div className="metric-label">Pending Approval</div>
              <div className="metric-subtext">Awaiting review</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsTab;
