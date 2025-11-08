import React from 'react';
import '../../styles/ApprovalsTab.css';

/**
 * ApprovalsTab Component
 * Manages pending seller registrations and product listings
 * Props:
 * - sellers: array of pending sellers
 * - products: array of pending products
 * - onApproveSeller: function to approve a seller
 * - onRejectSeller: function to reject a seller
 * - onApproveProduct: function to approve a product
 * - onRejectProduct: function to reject a product
 */
function ApprovalsTab({ 
  sellers, 
  products, 
  onApproveSeller, 
  onRejectSeller, 
  onApproveProduct, 
  onRejectProduct 
}) {
  return (
    <div className="approvals-section">
      {/* Pending Sellers Section */}
      <div className="sellers-section">
        <h2>Seller Registrations Awaiting Approval</h2>
        
        {sellers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>All Caught Up!</h3>
            <p>No pending seller registrations at the moment.</p>
          </div>
        ) : (
          <div className="sellers-grid">
            {sellers.map(seller => (
              <div key={seller.id} className="seller-card">
                {/* Seller Header - Name and Date */}
                <div className="seller-card-header">
                  <div className="seller-info">
                    <h3>{seller.businessName}</h3>
                    <p className="seller-owner">{seller.ownerName}</p>
                  </div>
                  <div className="seller-date">
                    <span className="date-label">Submitted</span>
                    <span className="date-value">{seller.submittedDate}</span>
                  </div>
                </div>

                {/* Seller Details - Contact and Business Info */}
                <div className="seller-details">
                  <div className="detail-row">
                    <span className="detail-label">📧 Email:</span>
                    <span className="detail-value">{seller.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📞 Phone:</span>
                    <span className="detail-value">{seller.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📍 Address:</span>
                    <span className="detail-value">{seller.businessAddress}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🧾 GST:</span>
                    <span className="detail-value">{seller.gstNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🏦 Bank:</span>
                    <span className="detail-value">{seller.bankAccount}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="seller-actions">
                  <button
                    className="approve-btn"
                    onClick={() => onApproveSeller(seller.id)}
                  >
                    ✅ Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => onRejectSeller(seller.id)}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Products Section */}
      <div className="products-section">
        <h2>Product Listings Awaiting Approval</h2>
        
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>All Caught Up!</h3>
            <p>No pending product listings at the moment.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-approval-card">
                {/* Product Header - Icon and Date */}
                <div className="product-approval-header">
                  <div className="product-emoji">{product.image}</div>
                  <div className="product-date">
                    <span className="date-label">Submitted</span>
                    <span className="date-value">{product.submittedDate}</span>
                  </div>
                </div>

                {/* Product Details */}
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">
                  Category: <strong>{product.category}</strong>
                </p>
                <p className="product-description">{product.description}</p>

                {/* Product Images */}
                {product.images && product.images.length > 0 && (
                  <div className="product-images-preview">
                    {product.images.slice(0, 3).map((img, idx) => (
                      <img key={idx} src={img} alt={`${product.name} ${idx + 1}`} className="preview-img" />
                    ))}
                  </div>
                )}

                {/* Pricing Information */}
                <div className="product-pricing">
                  <span className="product-price">₹{product.price.toLocaleString()}</span>
                  {product.discount > 0 && (
                    <>
                      <span className="product-original">₹{Math.round(product.price / (1 - product.discount / 100)).toLocaleString()}</span>
                      <span className="product-discount">{product.discount}% OFF</span>
                    </>
                  )}
                </div>

                {/* Stock Information */}
                <div className="product-stock">
                  <span className="stock-label">Stock:</span>
                  <span className="stock-value">{product.stock} units</span>
                </div>

                {/* Seller Information */}
                <div className="product-seller-info">
                  <span className="seller-label">👤 Seller:</span>
                  <span className="seller-name">{product.seller}</span>
                </div>

                {/* Action Buttons */}
                <div className="product-actions" style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #f3f4f6' }}>
                  <button
                    className="approve-btn"
                    onClick={() => onApproveProduct(product.id)}
                    style={{
                      flex: 1,
                      padding: '1rem 1.25rem',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    ✅ Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => onRejectProduct(product.id)}
                    style={{
                      flex: 1,
                      padding: '1rem 1.25rem',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    ❌ Reject
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

export default ApprovalsTab;
