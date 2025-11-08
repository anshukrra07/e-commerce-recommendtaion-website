import React from 'react';
import '../styles/ProductList.css';

/**
 * ProductList Component
 * Displays seller's products with status indicators
 */
const ProductList = ({ products, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="products-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="no-products">
        <div className="no-products-icon">📦</div>
        <h3>No Products Yet</h3>
        <p>Click "Add New Product" to get started!</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      approved: { icon: '✅', label: 'Approved', class: 'status-approved' },
      pending: { icon: '⏳', label: 'Pending Approval', class: 'status-pending' },
      rejected: { icon: '❌', label: 'Rejected', class: 'status-rejected' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="product-list-grid">
      {products.map((product) => {
        const status = getStatusBadge(product.status);
        const finalPrice = product.price * (1 - (product.discount || 0) / 100);

        return (
          <div key={product._id || product.id} className="product-list-card">
            <div className={`product-status-badge ${status.class}`}>
              {status.icon} {status.label}
            </div>

            <div className="product-list-image">
              {product.image}
            </div>

            <div className="product-list-info">
              <h4 className="product-list-name">{product.name}</h4>
              <p className="product-list-category">
                {getCategoryLabel(product.category)}
              </p>

              <div className="product-list-pricing">
                <span className="product-list-price">₹{finalPrice.toLocaleString()}</span>
                {product.discount > 0 && (
                  <>
                    <span className="product-list-original">₹{product.price.toLocaleString()}</span>
                    <span className="product-list-discount">{product.discount}% OFF</span>
                  </>
                )}
              </div>

              <div className="product-list-stats">
                <div className="stat-item">
                  <span className="stat-label">Stock:</span>
                  <span className={`stat-value ${product.stock < 10 ? 'low-stock' : ''}`}>
                    {product.stock}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Sold:</span>
                  <span className="stat-value">{product.sold || 0}</span>
                </div>
                {product.revenue > 0 && (
                  <div className="stat-item">
                    <span className="stat-label">Revenue:</span>
                    <span className="stat-value">₹{product.revenue.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="product-list-actions">
                <button 
                  className="btn-edit"
                  onClick={() => onEdit(product)}
                  title="Edit product"
                >
                  ✏️ Edit
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => onDelete(product._id || product.id)}
                  title="Delete product"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Helper function to get category label
const getCategoryLabel = (category) => {
  const labels = {
    'electronics': '📱 Electronics',
    'clothing': '👕 Clothing',
    'footwear': '👟 Footwear',
    'accessories': '💍 Accessories',
    'home-decor': '🏠 Home Decor'
  };
  return labels[category] || category;
};

export default ProductList;
