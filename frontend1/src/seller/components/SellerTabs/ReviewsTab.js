import React from 'react';

/**
 * ReviewsTab Component
 * Shows product reviews from customers
 * Props:
 * - reviews: object with products array
 */
function ReviewsTab({ reviews }) {
  // Calculate average rating for products
  const avgProductRating = reviews.products.length > 0
    ? (reviews.products.reduce((sum, r) => sum + r.rating, 0) / reviews.products.length).toFixed(1)
    : 0;

  // Calculate total reviews
  const totalReviews = reviews.products.length;

  // Render stars
  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="reviews-tab">
      <h2>⭐ Reviews & Ratings</h2>

      {/* Summary Card */}
      <div className="reviews-summary">
        <div className="summary-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <div className="card-label">Total Product Reviews</div>
            <div className="card-value">{totalReviews}</div>
            <div className="card-rating">{avgProductRating} ⭐ average rating</div>
          </div>
        </div>
      </div>

      {/* Product Reviews */}
      <div className="reviews-section">
        <h3>📦 Product Reviews ({reviews.products.length})</h3>
        {reviews.products.length === 0 ? (
          <div className="no-reviews">
            <p>📭 No reviews yet</p>
            <span>Customer reviews will appear here</span>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.products.map(review => (
              <div key={review.id} className="review-card">
                {/* Product Header */}
                <div className="review-product-header">
                  <span className="product-icon">{review.productIcon}</span>
                  <span className="product-name">{review.productName}</span>
                </div>

                {/* Review Content */}
                <div className="review-content">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.customerName.charAt(0)}
                      </div>
                      <div className="reviewer-details">
                        <div className="reviewer-name">
                          {review.customerName}
                          {review.verified && (
                            <span className="verified-badge">✓ Verified</span>
                          )}
                        </div>
                        <div className="review-date">{review.date}</div>
                      </div>
                    </div>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <div className="review-helpful">
                    👍 {review.helpful} people found this helpful
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewsTab;
