import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { socket, joinUserRoom } from '../lib/socket';
import getBackendURL from '../utils/environment.js';
import './OrderDetailsPage.css';

const API_BASE = getBackendURL();

async function fetchOrder(id, token) {
  const res = await fetch(`${API_BASE}/api/orders/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  const data = await res.json();
  if (!res.ok || data?.success === false) throw new Error(data?.message || 'Failed to load order');
  return data?.data || data; // support either wrapper or raw
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('authToken');

  const load = useCallback(async () => {
    try {
      setError('');
      const o = await fetchOrder(orderId, token);
      setOrder(o);
    } catch (e) {
      setError(e.message || String(e));
    }
  }, [orderId, token]);

  useEffect(() => { if (orderId) load(); }, [orderId, load]);

  // Real-time updates via Socket.IO (if backend supports it)
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('userData') || '{}');
      const uid = user?._id || user?.id;
      if (uid) joinUserRoom(uid);
      const handler = (evt) => { if (evt.orderId === orderId) load(); };
      socket.on('order:update', handler);
      return () => socket.off('order:update', handler);
    } catch {}
  }, [orderId, load]);

  // Fallback polling
  useEffect(() => {
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [load]);

  if (error) return (
    <div className="order-details-page">
      <div className="order-details-container">
        <div className="error-message-details">{error}</div>
      </div>
    </div>
  );
  
  if (!order) return (
    <div className="order-details-page">
      <div className="order-details-container">
        <div className="loading-message">Loading order details...</div>
      </div>
    </div>
  );

  const amounts = order.amounts || {};
  const items = order.items || [];
  const inv = order.invoice || {};

  return (
    <div className="order-details-page">
      <div className="order-details-container">
        <h2>Order #{order._id.slice(-8)}</h2>
        
        <div className="order-card-details">
          <div className="order-status-header">
            <div className="status-group">
              <span className="status-label">Payment:</span>
              <span className={`status-value ${order.payment?.status || 'pending'}`}>
                {order.payment?.status || 'pending'}
              </span>
            </div>
            <div className="status-group">
              <span className="status-label">Fulfillment:</span>
              <span className={`status-value ${order.fulfillment?.status || 'created'}`}>
                {order.fulfillment?.status || 'created'}
              </span>
            </div>
          </div>

          <div className="order-section">
            <h3>📦 Items</h3>
            <ul className="items-list">
              {items.map((it, idx) => (
                <li key={idx} className="order-item-detail">
                  <div className="item-info">
                    <span className="item-emoji-large">{it.image || '📦'}</span>
                    <div className="item-text">
                      <div className="item-title">{it.name || it.product}</div>
                      <div className="item-meta">Quantity: {it.qty} × ₹{it.price}</div>
                    </div>
                  </div>
                  <div className="item-total">₹{(it.price * it.qty).toFixed(2)}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-section">
            <h3>💰 Order Totals</h3>
            <div className="totals-section">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{(amounts.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax (18% GST)</span>
                <span>₹{(amounts.tax || 0).toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>{amounts.shipping === 0 ? 'FREE' : `₹${(amounts.shipping || 0).toFixed(2)}`}</span>
              </div>
              {amounts.discount > 0 && (
                <div className="total-row">
                  <span>Discount</span>
                  <span>- ₹{(amounts.discount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="total-row grand-total">
                <span>Total</span>
                <span>₹{(amounts.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {inv?.url && (
            <div className="invoice-section">
              <a href={`${API_BASE}${inv.url}`} target="_blank" rel="noreferrer" className="invoice-link">
                📄 Download Invoice
              </a>
            </div>
          )}

          <div className="order-section timeline-section">
            <h3>Delivery Timeline</h3>
            <ul className="timeline-list">
              {(order.fulfillment?.events || []).map((ev, i) => (
                <li key={i} className="timeline-item">
                  <div className="timeline-time">{new Date(ev.at).toLocaleString()}</div>
                  <div className="timeline-event">{ev.code}</div>
                  <div className="timeline-desc">{ev.description}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
