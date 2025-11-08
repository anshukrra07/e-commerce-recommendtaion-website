import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import CategoryNav from '../../shared/components/CategoryNav/CategoryNav';
import '../styles/OrdersPage.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5050';

function OrdersPage({ isLoggedIn, userName, userRole, onLoginSuccess, onLogout }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load orders');
        }
        
        setOrders(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn, navigate]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { emoji: '⏳', class: 'pending' },
      paid: { emoji: '✅', class: 'paid' },
      failed: { emoji: '❌', class: 'failed' },
      refunded: { emoji: '💰', class: 'refunded' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.emoji} {status}</span>;
  };

  const getFulfillmentBadge = (status) => {
    const statusConfig = {
      created: { emoji: '📝', class: 'created' },
      processing: { emoji: '⚙️', class: 'processing' },
      shipped: { emoji: '🚚', class: 'shipped' },
      delivered: { emoji: '✅', class: 'delivered' },
      cancelled: { emoji: '❌', class: 'cancelled' }
    };
    const config = statusConfig[status] || statusConfig.created;
    return <span className={`fulfillment-badge ${config.class}`}>{config.emoji} {status}</span>;
  };

  return (
    <div className="orders-page">
      <Header 
        onLoginClick={() => {}}
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={userRole}
        onLogout={onLogout}
      />
      <CategoryNav />
      
      <div className="page-header">
        <div className="page-header-content">
          <h1>My Orders</h1>
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </div>

      <div className="orders-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner">⏳</div>
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Error loading orders</h3>
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here</p>
            <button className="shop-btn" onClick={() => navigate('/')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card" onClick={() => navigate(`/order/${order._id}`)}>
                <div className="order-header">
                  <div className="order-id">
                    <strong>Order #{order._id.slice(-8)}</strong>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="order-status">
                    {getStatusBadge(order.payment?.status)}
                    {getFulfillmentBadge(order.fulfillment?.status)}
                  </div>
                </div>

                <div className="order-items">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="order-item-preview">
                      <span className="item-emoji">{item.image || '📦'}</span>
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">× {item.qty}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="more-items">+{order.items.length - 3} more items</div>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span>Total:</span>
                    <strong>₹{order.amounts?.total?.toFixed(2)}</strong>
                  </div>
                  <button className="view-btn" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/order/${order._id}`);
                  }}>
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
