import React, { useState } from 'react';

/**
 * OrdersTab Component
 * Manages seller's orders with filtering and status management
 * Props:
 * - orders: array of orders
 * - onOrderAction: function to handle order actions (ship, return approval)
 */
function OrdersTab({ orders, onOrderAction }) {
  const [filter, setFilter] = useState('all');

  // Filter orders based on selected filter
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  // Count orders by status
  const orderCounts = {
    all: orders.length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    returnRequested: orders.filter(o => o.status === 'return-requested').length
  };

  return (
    <div className="orders-tab">
      <h2>Orders Management</h2>

      {/* Filter Buttons */}
      <div className="order-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Orders ({orderCounts.all})
        </button>
        <button 
          className={`filter-btn ${filter === 'processing' ? 'active' : ''}`}
          onClick={() => setFilter('processing')}
        >
          ⏳ Processing ({orderCounts.processing})
        </button>
        <button 
          className={`filter-btn ${filter === 'shipped' ? 'active' : ''}`}
          onClick={() => setFilter('shipped')}
        >
          🚚 Shipped ({orderCounts.shipped})
        </button>
        <button 
          className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilter('delivered')}
        >
          ✅ Delivered ({orderCounts.delivered})
        </button>
        <button 
          className={`filter-btn ${filter === 'return-requested' ? 'active' : ''}`}
          onClick={() => setFilter('return-requested')}
        >
          ↩️ Returns ({orderCounts.returnRequested})
        </button>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No Orders Found</h3>
            <p>No orders match the current filter.</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>{order.productName}</td>
                  <td>{order.customer}</td>
                  <td>{order.quantity}</td>
                  <td>₹{order.total.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status === 'delivered' && '✅ Delivered'}
                      {order.status === 'shipped' && '🚚 Shipped'}
                      {order.status === 'processing' && '⏳ Processing'}
                      {order.status === 'return-requested' && '↩️ Return Requested'}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-badge ${order.payment}`}>
                      {order.payment === 'paid' ? '✅ Paid' : '⏳ Pending'}
                    </span>
                  </td>
                  <td>{order.date}</td>
                  <td>
                    <div className="order-actions">
                      {order.status === 'processing' && (
                        <button 
                          className="action-btn ship"
                          onClick={() => onOrderAction(order.id, 'ship')}
                        >
                          🚚 Ship
                        </button>
                      )}
                      {order.status === 'return-requested' && (
                        <button 
                          className="action-btn approve-return"
                          onClick={() => onOrderAction(order.id, 'approve-return')}
                        >
                          ✅ Approve
                        </button>
                      )}
                      {(order.status === 'delivered' || order.status === 'shipped') && (
                        <span className="no-action">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default OrdersTab;
