import React from 'react';

/**
 * OverviewTab Component
 * Shows seller dashboard overview with key metrics and recent activity
 * Props:
 * - analytics: object with revenue, orders, sales metrics
 * - myProducts: array of seller's products
 * - orders: array of recent orders
 */
function OverviewTab({ analytics, myProducts, orders }) {
  // Get low stock products (< 20 units)
  const lowStockProducts = myProducts.filter(p => p.stock < 20);
  
  // Get recent orders (last 5)
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="dashboard-overview">
      {/* Metrics Cards */}
      <div className="metrics-cards">
        <div className="metric-card revenue">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-label">Total Revenue</div>
            <div className="metric-value">₹{(analytics.totalRevenue / 100000).toFixed(2)}L+</div>
            <div className="metric-growth positive">↑ {analytics.revenueGrowth}%</div>
          </div>
        </div>

        <div className="metric-card orders">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <div className="metric-label">Total Orders</div>
            <div className="metric-value">{analytics.ordersThisMonth}</div>
            <div className="metric-growth positive">+{analytics.totalOrders} this month</div>
          </div>
        </div>

        <div className="metric-card sold">
          <div className="metric-icon">🛍️</div>
          <div className="metric-content">
            <div className="metric-label">Items Sold</div>
            <div className="metric-value">{analytics.totalSold}</div>
            <div className="metric-subtext">Total units</div>
          </div>
        </div>

        <div className="metric-card avg-order">
          <div className="metric-icon">💵</div>
          <div className="metric-content">
            <div className="metric-label">Avg Order Value</div>
            <div className="metric-value">₹{Math.round(analytics.avgOrderValue).toLocaleString()}</div>
            <div className="metric-subtext">Per order</div>
          </div>
        </div>
      </div>

      {/* Best Selling Product */}
      {analytics.bestSelling && (
        <div className="best-selling-card">
          <h3>🏆 Best Selling Product</h3>
          <div className="best-product-content">
            <div className="best-product-icon">{analytics.bestSelling.image}</div>
            <div className="best-product-info">
              <h4>{analytics.bestSelling.name}</h4>
              <div className="best-product-stats">
                <span className="stat">
                  <strong>{analytics.bestSelling.sold}</strong> units sold
                </span>
                <span className="stat">
                  <strong>₹{(analytics.bestSelling.revenue / 1000).toFixed(1)}K</strong> revenue
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="low-stock-alert">
          <h3>⚠️ Low Stock Alert</h3>
          <div className="low-stock-items">
            {lowStockProducts.map(product => (
              <div key={product.id} className="low-stock-item">
                <span className="product-icon">{product.image}</span>
                <span className="product-name">{product.name}</span>
                <span className="stock-badge warning">{product.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="recent-orders-preview">
        <h3>📋 Recent Orders</h3>
        <div className="orders-preview-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>{order.productName}</td>
                  <td>{order.customer}</td>
                  <td>₹{order.total.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status === 'delivered' && '✅ Delivered'}
                      {order.status === 'shipped' && '🚚 Shipped'}
                      {order.status === 'processing' && '⏳ Processing'}
                      {order.status === 'return-requested' && '↩️ Return'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OverviewTab;
