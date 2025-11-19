import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import CategoryNav from '../../shared/components/CategoryNav/CategoryNav';
import Footer from '../../shared/components/Footer/Footer';
import ProductCard from '../../shared/components/ProductCard/ProductCard';
import LoginModal from '../../shared/components/LoginModal/LoginModal';
import '../styles/SellerStorefront.css';
import { API_BASE_URL } from '../../utils/environment.js';

const API_URL = API_BASE_URL;

const SellerStorefront = ({ isLoggedIn, userName, userRole, onLoginSuccess, onLogout }) => {
  const { sellerKey } = useParams();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewFilters, setReviewFilters] = useState({ rating: 'all', sort: 'newest' });

  // Fetch seller data
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        
        // Fetch seller info (by id or name)
        const sellerRes = await fetch(`${API_URL}/sellers/${sellerKey}`);
        const sellerData = await sellerRes.json();
        
        if (sellerData.success) {
          setSeller(sellerData.data);
        } else {
          alert('Seller not found');
          navigate('/');
          return;
        }

        const resolvedSellerId = sellerData.data._id;

        // Fetch seller's products (filter by resolved seller id)
        const productsRes = await fetch(`${API_URL}/products?seller=${resolvedSellerId}&status=approved`);
        const productsData = await productsRes.json();
        
        if (productsData.success) {
          // Normalize product ids so components can rely on `product.id`
          const normalized = (productsData.data || []).map(p => ({ ...p, id: p.id || p._id }));
          setProducts(normalized);
        }

        // Fetch seller reviews
        const reviewsRes = await fetch(`${API_URL}/reviews/seller/${resolvedSellerId}`);
        const reviewsData = await reviewsRes.json();
        
        if (reviewsData.success) {
          setReviews(reviewsData.data.reviews || []);
          setAverageRating(reviewsData.data.averageRating || 0);
          setTotalReviews(reviewsData.data.totalReviews || 0);
        }

      } catch (error) {
        console.error('Error fetching seller data:', error);
        alert('Error loading seller information');
      } finally {
        setLoading(false);
      }
    };

    if (sellerKey) {
      fetchSellerData();
    }
  }, [sellerKey, isLoggedIn, userRole, navigate]);

  // Get unique categories from products
  const categories = [...new Set(products.map(p => p.category))];

  // Filter products by category
  let filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // Sort products
  if (sortBy === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  }

  // Reviews: apply filters and sorting
  let displayedReviews = [...reviews];
  if (reviewFilters.rating !== 'all') {
    displayedReviews = displayedReviews.filter(r => r.rating === Number(reviewFilters.rating));
  }
  if (reviewFilters.sort === 'newest') {
    displayedReviews = displayedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (reviewFilters.sort === 'highest') {
    displayedReviews = displayedReviews.sort((a, b) => b.rating - a.rating);
  } else if (reviewFilters.sort === 'lowest') {
    displayedReviews = displayedReviews.sort((a, b) => a.rating - b.rating);
  }

  const handleAddToCart = (product) => {
    setCartCount(cartCount + 1);
    alert(`Added ${product.name} to cart!`);
  };

  if (loading) {
    return (
      <div className="seller-storefront-page">
        <Header 
          cartCount={cartCount} 
          onLoginClick={() => setShowLoginModal(true)}
          isLoggedIn={isLoggedIn}
          userName={userName}
          userRole={userRole}
          onLogout={onLogout}
        />
        <CategoryNav />
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <h2>Loading seller information...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="seller-storefront-page">
        <Header 
          cartCount={cartCount} 
          onLoginClick={() => setShowLoginModal(true)}
          isLoggedIn={isLoggedIn}
          userName={userName}
          userRole={userRole}
          onLogout={onLogout}
        />
        <CategoryNav />
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
          <h2>Seller not found</h2>
          <button className="btn-reset" onClick={() => navigate('/')}>Go Home</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="seller-storefront-page">
      <Header 
        cartCount={cartCount} 
        onLoginClick={() => setShowLoginModal(true)}
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={userRole}
        onLogout={onLogout}
      />
      <CategoryNav />

      {/* Seller Banner */}
      <div className="seller-banner" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container">
          <button className="back-btn-white" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <div className="seller-banner-content">
            <div className="seller-logo-large">🏪</div>
            <div className="seller-banner-info">
              <h1>{seller.businessName}</h1>
              <div className="seller-meta">
                <span className="seller-rating">⭐ {averageRating} ({totalReviews} reviews)</span>
                <span className="seller-stat">📦 {products.length} Products</span>
                <span className="seller-stat">📍 {seller.businessAddress}</span>
              </div>
              <p className="seller-description">Welcome to {seller.businessName} - Your trusted online seller</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="storefront-layout">
          {/* Sidebar */}
          <aside className="storefront-sidebar">
            {/* About Seller */}
            <div className="sidebar-section">
              <h3>About Seller</h3>
              <div className="seller-info-box">
                <div className="info-row">
                  <span className="info-label">📅 Joined:</span>
                  <span className="info-value">{new Date(seller.submittedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">📧 Email:</span>
                  <span className="info-value">{seller.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">👤 Owner:</span>
                  <span className="info-value">{seller.ownerName}</span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="sidebar-section">
              <h3>Categories</h3>
              <div className="category-filters">
                <button 
                  className={`category-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All Products ({products.length})
                </button>
                {categories.map(cat => {
                  const count = products.filter(p => p.category === cat).length;
                  return (
                    <button 
                      key={cat}
                      className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Products Section */}
          <div className="storefront-main">
            <div className="storefront-header">
              <div className="storefront-title">
                <h2>Products ({filteredProducts.length})</h2>
                {selectedCategory !== 'all' && (
                  <span className="category-badge">{selectedCategory}</span>
                )}
              </div>
              <div className="storefront-sort">
                <label>Sort by:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="no-products-state">
                <p>No products found in this category</p>
                <button className="btn-reset" onClick={() => setSelectedCategory('all')}>
                  Show All Products
                </button>
              </div>
            ) : (
              <div className="storefront-products-grid">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    category={product.category}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2 className="reviews-title">Customer Reviews</h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Reviews are based on products from this seller. Visit individual product pages to leave a review.</p>

          {/* Reviews List */}
          <div className="reviews-list">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0 }}>All Reviews ({totalReviews})</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label style={{ color: '#4b5563', fontWeight: 600 }}>Filter:</label>
                <select value={reviewFilters.rating} onChange={(e) => setReviewFilters({ ...reviewFilters, rating: e.target.value })}>
                  <option value="all">All ratings</option>
                  <option value="5">5 stars</option>
                  <option value="4">4 stars</option>
                  <option value="3">3 stars</option>
                  <option value="2">2 stars</option>
                  <option value="1">1 star</option>
                </select>
                <label style={{ color: '#4b5563', fontWeight: 600, marginLeft: '0.75rem' }}>Sort:</label>
                <select value={reviewFilters.sort} onChange={(e) => setReviewFilters({ ...reviewFilters, sort: e.target.value })}>
                  <option value="newest">Newest</option>
                  <option value="highest">Highest rating</option>
                  <option value="lowest">Lowest rating</option>
                </select>
              </div>
            </div>
            {displayedReviews.length === 0 ? (
              <p className="no-reviews">No reviews match the selected filters.</p>
            ) : (
              <div className="reviews-grid">
                {displayedReviews.map((review) => (
                  <div key={review._id} className="review-item">
                    <div className="review-header">
                      <div className="review-author">
                        <strong>{review.customer?.name || 'Anonymous'}</strong>
                        <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                      </div>
                      <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    {review.product && (
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 500 }}>
                        📦 Product: {review.product.name}
                      </div>
                    )}
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={onLoginSuccess}
      />
    </div>
  );
};

export default SellerStorefront;
