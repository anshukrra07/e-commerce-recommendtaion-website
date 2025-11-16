import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import CategoryNav from '../../shared/components/CategoryNav/CategoryNav';
import LoginModal from '../../shared/components/LoginModal/LoginModal';
import { API_BASE_URL } from '../../utils/environment.js';
import '../styles/ComparisonPage.css';

function ComparisonPage({ isLoggedIn, userName, userRole, onLoginSuccess, onLogout }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [compareItems, setCompareItems] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch products from API based on IDs from URL params
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Get product IDs from URL params (e.g., ?ids=id1,id2,id3)
        const idsParam = searchParams.get('ids');
        if (!idsParam) {
          setCompareItems([]);
          setLoading(false);
          return;
        }

        const productIds = idsParam.split(',').filter(id => id.trim());
        if (productIds.length === 0) {
          setCompareItems([]);
          setLoading(false);
          return;
        }

        // Fetch all products
        const productsRes = await fetch(`${API_BASE_URL}/products?status=approved`);
        const productsData = await productsRes.json();

        if (productsData.success) {
          // Filter products matching the IDs
          const matchedProducts = productsData.products
            .filter(p => productIds.includes(p._id))
            .map(p => ({
              id: p._id,
              name: p.name,
              emoji: p.image,
              brand: typeof p.seller === 'object' ? p.seller?.businessName : (p.seller || 'Generic'),
              price: p.price,
              original: Math.round(p.price / (1 - (p.discount || 0) / 100)),
              rating: 4 + Math.random(),
              reviews: p.sold || 0,
              inStock: p.stock > 0,
              specifications: p.specifications || {},
              features: p.keyFeatures || ['Premium quality', 'Fast delivery'],
              pros: ['Good quality', 'Value for money'],
              cons: ['Limited stock']
            }));
          
          setCompareItems(matchedProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const removeItem = (id) => {
    if (compareItems.length <= 2) {
      alert('You need at least 2 items to compare!');
      return;
    }
    const item = compareItems.find(item => item.id === id);
    if (window.confirm(`Remove "${item.name}" from comparison?`)) {
      setCompareItems(compareItems.filter(item => item.id !== id));
    }
  };

  const addToCart = (item) => {
    alert(`"${item.name}" added to cart!`);
  };

  // Get all unique specification keys
  const getAllSpecKeys = () => {
    const keys = new Set();
    compareItems.forEach(item => {
      Object.keys(item.specifications).forEach(key => keys.add(key));
    });
    return Array.from(keys);
  };

  const specKeys = getAllSpecKeys();

  return (
    <div className="comparison-page">
      <Header 
        cartCount={0} 
        onLoginClick={() => setShowLoginModal(true)}
        compareCount={compareItems.length}
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={userRole}
        onLogout={onLogout}
      />
      <CategoryNav />
      
      <div className="comparison-header">
        <div className="comparison-header-content">
          <h1>⚖️ Compare Products</h1>
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </div>

      <div className="comparison-container">
        {loading ? (
          <div className="empty-comparison">
            <div className="empty-icon">⏳</div>
            <h3>Loading products...</h3>
          </div>
        ) : compareItems.length === 0 ? (
          <div className="empty-comparison">
            <div className="empty-icon">⚖️</div>
            <h3>No products to compare</h3>
            <p>Add products from the catalog to compare them here</p>
            <button className="browse-btn" onClick={() => navigate('/')}>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="comparison-table-wrapper">
            <div className="comparison-info">
              <p>Comparing {compareItems.length} products side by side</p>
            </div>

            <div className="comparison-grid">
              {/* Product Cards Row */}
              <div className="comparison-row header-row">
                <div className="row-label"></div>
                {compareItems.map(item => (
                  <div key={item.id} className="product-column">
                    <button 
                      className="remove-product-btn"
                      onClick={() => removeItem(item.id)}
                    >
                      ✕
                    </button>
                    <div className="product-emoji-large">{item.emoji}</div>
                    <h3 className="product-title">{item.name}</h3>
                    <p className="product-brand">{item.brand}</p>
                    <div className="product-rating-row">
                      ⭐ {item.rating} <span>({item.reviews} reviews)</span>
                    </div>
                    {!item.inStock && (
                      <span className="out-stock-badge">Out of Stock</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Price Row */}
              <div className="comparison-row price-row">
                <div className="row-label">
                  <strong>Price</strong>
                </div>
                {compareItems.map(item => (
                  <div key={item.id} className="product-column">
                    <div className="price-info">
                      <span className="current-price">₹{item.price}</span>
                      <span className="original-price">₹{item.original}</span>
                      <span className="discount-badge">
                        {Math.round(((item.original - item.price) / item.original) * 100)}% OFF
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Row */}
              <div className="comparison-row action-row">
                <div className="row-label"></div>
                {compareItems.map(item => (
                  <div key={item.id} className="product-column">
                    <button 
                      className="add-cart-btn"
                      onClick={() => addToCart(item)}
                      disabled={!item.inStock}
                    >
                      {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Specifications Section */}
              <div className="comparison-section">
                <h3 className="section-title">📋 Specifications</h3>
              </div>

              {specKeys.map(specKey => (
                <div key={specKey} className="comparison-row spec-row">
                  <div className="row-label">{specKey}</div>
                  {compareItems.map(item => (
                    <div key={item.id} className="product-column">
                      <span className="spec-value">
                        {item.specifications[specKey] || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              ))}

              {/* Features Section */}
              <div className="comparison-section">
                <h3 className="section-title">✨ Features</h3>
              </div>

              <div className="comparison-row features-row">
                <div className="row-label">Key Features</div>
                {compareItems.map(item => (
                  <div key={item.id} className="product-column">
                    <ul className="features-list">
                      {item.features.map((feature, idx) => (
                        <li key={idx}>✓ {feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Pros & Cons Section */}
              <div className="comparison-section">
                <h3 className="section-title">👍 Pros & Cons</h3>
              </div>

              <div className="comparison-row pros-cons-row">
                <div className="row-label">Advantages</div>
                {compareItems.map(item => (
                  <div key={item.id} className="product-column">
                    <ul className="pros-list">
                      {item.pros.map((pro, idx) => (
                        <li key={idx}>✅ {pro}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="comparison-row pros-cons-row">
                <div className="row-label">Disadvantages</div>
                {compareItems.map(item => (
                  <div key={item.id} className="product-column">
                    <ul className="cons-list">
                      {item.cons.map((con, idx) => (
                        <li key={idx}>❌ {con}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Final Actions */}
              <div className="comparison-row final-actions-row">
                <div className="row-label"></div>
                {compareItems.map(item => (
                  <div key={item.id} className="product-column">
                    <div className="final-actions">
                      <button 
                        className="buy-now-btn"
                        disabled={!item.inStock}
                      >
                        {item.inStock ? 'Buy Now' : 'Notify Me'}
                      </button>
                      <button 
                        className="wishlist-btn-compare"
                      >
                        ❤️ Wishlist
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={onLoginSuccess}
      />
    </div>
  );
}

export default ComparisonPage;
