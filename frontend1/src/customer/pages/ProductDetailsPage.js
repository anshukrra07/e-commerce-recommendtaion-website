import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import CategoryNav from '../../shared/components/CategoryNav/CategoryNav';
import Footer from '../../shared/components/Footer/Footer';
import LoginModal from '../../shared/components/LoginModal/LoginModal';
import ChatModal from '../../shared/components/ChatModal/ChatModal';
import '../styles/ProductDetailsPage.css';

const ProductDetailsPage = ({ isLoggedIn, userName, userRole, onLoginSuccess, onLogout }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [pincode, setPincode] = useState('');
  const [isPincodeValid, setIsPincodeValid] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [showChatModal, setShowChatModal] = useState(false);

  // Reviews state (product reviews)
  const [reviewsData, setReviewsData] = useState({ reviews: [], totalReviews: 0, averageRating: 0 });
  const [myReviews, setMyReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const reviews = reviewsData.reviews || [];

  // Fetch product details from API
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5050/api/products/${productId}`);
        const data = await response.json();
        
        if (data.success && data.product) {
          // Transform product data
          const transformedProduct = {
            id: data.product._id,
            name: data.product.name,
            category: data.product.category,
            price: data.product.price,
            discount: data.product.discount || 0,
            original: Math.round(data.product.price / (1 - (data.product.discount || 0) / 100)),
            image: data.product.image,
            images: data.product.images || [],
            emoji: data.product.image, // Fallback to image field
            description: data.product.description || '',
            specifications: data.product.specifications || {},
            keyFeatures: data.product.keyFeatures || [],
            seller: typeof data.product.seller === 'object' ? data.product.seller?.businessName : data.product.seller,
            sellerId: typeof data.product.seller === 'object' ? data.product.seller?._id : data.product.seller,
            inStock: data.product.stock > 0,
            stock: data.product.stock || 0,
            rating: 4 + Math.random(), // Random rating between 4-5
            reviews: data.product.sold || 0
          };
          setProduct(transformedProduct);
        } else {
          setProduct(null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  // Track product view for recommendations
  useEffect(() => {
    if (!product || !isLoggedIn || userRole !== 'customer') return;
    
    const startTime = Date.now();
    
    const trackView = async () => {
      try {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        const token = localStorage.getItem('authToken');
        
        await fetch('http://localhost:5050/api/recommendations/track-view', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId: product.id,
            duration
          })
        });
        console.log('👁️ Tracked view:', product.name, `${duration}s`);
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    };
    
    // Track when component unmounts or product changes
    return () => {
      trackView();
    };
  }, [product, isLoggedIn, userRole]);

  // Fetch ML-based similar products
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!product) return;
      
      try {
        const response = await fetch(`http://localhost:5050/api/recommendations/similar/${product.id}?limit=8`);
        const data = await response.json();
        
        if (data.success && data.products) {
          const similar = data.products.map(p => ({
            id: p._id,
            name: p.name,
            category: p.category,
            price: p.price,
            discount: p.discount || 0,
            original: Math.round(p.price / (1 - (p.discount || 0) / 100)),
            image: p.image,
            images: p.images || [],
            emoji: p.image,
            seller: typeof p.seller === 'object' ? p.seller?.businessName : p.seller,
            rating: 4 + Math.random(),
            similarityScore: p.similarityScore || 0
          }));
          
          setSimilarProducts(similar);
          console.log('🔍 Similar products loaded:', data.source, similar.length);
        }
      } catch (error) {
        console.error('Error fetching similar products:', error);
        // Fallback to category-based products
        fetchRelatedProductsFallback();
      }
    };

    const fetchRelatedProductsFallback = async () => {
      try {
        const response = await fetch('http://localhost:5050/api/products');
        const data = await response.json();
        
        if (data.success && data.products) {
          const allProducts = data.products.map(p => ({
            id: p._id,
            name: p.name,
            category: p.category,
            price: p.price,
            discount: p.discount || 0,
            original: Math.round(p.price / (1 - (p.discount || 0) / 100)),
            image: p.image,
            images: p.images || [],
            emoji: p.image,
            seller: typeof p.seller === 'object' ? p.seller?.businessName : p.seller,
            rating: 4 + Math.random()
          }));
          
          // Filter related products (same category)
          const related = allProducts
            .filter(p => p.id !== product.id && p.category === product.category)
            .slice(0, 8);
          
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Error fetching fallback products:', error);
      }
    };

    fetchSimilarProducts();
  }, [product]);

  // Fetch real reviews for the product
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.id) return;
      try {
        setLoadingReviews(true);
        // Public reviews
        const res = await fetch(`http://localhost:5050/api/reviews/product/${product.id}`);
        const data = await res.json();
        if (data.success) {
          setReviewsData(data.data);
        }
        // Customer's own reviews
        if (isLoggedIn && userRole === 'customer') {
          const token = localStorage.getItem('authToken');
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          if (token && userData.id) {
            // Filter customer's reviews from all reviews
            const customerReviews = (data.data.reviews || []).filter(
              r => r.customer?._id === userData.id || r.customer?.id === userData.id
            );
            setMyReviews(customerReviews);
          }
        }
      } catch (e) {
        console.error('Failed to load reviews', e);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [product, isLoggedIn, userRole]);

  // Loading state
  if (loading) {
    return (
      <div className="app">
        <Header 
          cartCount={cartCount} 
          onLoginClick={() => setShowLoginModal(true)}
          isLoggedIn={isLoggedIn}
          userName={userName}
          userRole={userRole}
          onLogout={onLogout}
        />
        <div className="product-loading">
          <div className="spinner"></div>
          <h2>Loading product...</h2>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="app">
        <Header 
          cartCount={cartCount} 
          onLoginClick={() => setShowLoginModal(true)}
          isLoggedIn={isLoggedIn}
          userName={userName}
          userRole={userRole}
          onLogout={onLogout}
        />
        <div className="product-not-found">
          <h2>Product Not Found</h2>
          <button onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  // Check if product has valid image URLs (not emojis)
  const hasValidImages = product.images && product.images.length > 0 && 
    product.images[0].startsWith('http');
  
  // Use uploaded images or fallback to emoji
  const productImages = hasValidImages
    ? product.images // Cloudinary URLs are already full URLs
    : [product.emoji, product.emoji, product.emoji, product.emoji];


  // Product specifications - use from API or defaults
  const specifications = product.specifications && Object.keys(product.specifications).length > 0
    ? Object.fromEntries(product.specifications)
    : {
        'Brand': product.seller || 'Generic',
        'Model': product.name,
        'Color': 'Multiple Options',
        'Material': 'Premium Quality',
        'Warranty': '1 Year Manufacturer Warranty',
        'Country of Origin': 'India'
      };

  // Product features - use from API or defaults
  const features = product.keyFeatures && product.keyFeatures.length > 0
    ? product.keyFeatures
    : [
        'Premium Quality Material',
        'Durable and Long-lasting',
        'Easy to Use',
        'Stylish Design',
        'Value for Money',
        'Fast Delivery Available'
      ];

  const handleAddToCart = () => {
    setCartCount(cartCount + quantity);
    alert(`Added ${quantity} ${product.name} to cart!`);
  };

  const handleBuyNow = () => {
    alert(`Proceeding to buy ${quantity} ${product.name} - Total: ₹${(product.price * quantity).toLocaleString()}`);
  };

  const handlePincodeCheck = () => {
    if (pincode.length === 6) {
      setIsPincodeValid(true);
    } else {
      setIsPincodeValid(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out ${product.name} at ₹${product.price.toLocaleString()}`;
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
    setShowShareMenu(false);
  };

  const getSellerSlug = (sellerName) => {
    return sellerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const discount = product.discount || Math.round(((product.original - product.price) / product.original) * 100);

  return (
    <div className="product-details-page">
      <Header 
        cartCount={cartCount} 
        onLoginClick={() => setShowLoginModal(true)}
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={userRole}
        onLogout={onLogout}
      />
      <CategoryNav />

      <div className="container">
        <div className="breadcrumb">
          <button onClick={() => navigate('/')}>Home</button>
          <span>/</span>
          <button onClick={() => navigate(-1)}>Products</button>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="product-details-container">
          {/* Images Section */}
          <div className="product-images-section">
            <div className="image-actions">
              <button 
                className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlist}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isWishlisted ? '❤️' : '🤍'}
              </button>
              <div className="share-menu-container">
                <button 
                  className="share-btn"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  title="Share product"
                >
                  📤 Share
                </button>
                {showShareMenu && (
                  <div className="share-menu">
                    <button onClick={() => handleShare('whatsapp')}>💬 WhatsApp</button>
                    <button onClick={() => handleShare('facebook')}>📘 Facebook</button>
                    <button onClick={() => handleShare('twitter')}>🐦 Twitter</button>
                    <button onClick={() => handleShare('copy')}>🔗 Copy Link</button>
                  </div>
                )}
              </div>
            </div>
            <div className="main-image">
              <div 
                className={`main-image-display ${isZoomed ? 'zoomed' : ''}`}
                onMouseEnter={() => hasValidImages ? setIsZoomed(true) : null}
                onMouseLeave={() => setIsZoomed(false)}
              >
                {hasValidImages && (
                  <img 
                    src={productImages[selectedImage]} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                )}
                <span 
                  className="product-emoji-large" 
                  style={{ display: hasValidImages ? 'none' : 'flex' }}
                >
                  {product.emoji || product.image}
                </span>
              </div>
              {isZoomed && hasValidImages && <div className="zoom-hint">Move mouse to zoom</div>}
            </div>
            <div className="image-thumbnails">
              {productImages.map((img, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  {hasValidImages && (
                    <img 
                      src={img} 
                      alt={`${product.name} ${index + 1}`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  )}
                  <span 
                    className="thumbnail-emoji" 
                    style={{ display: hasValidImages ? 'none' : 'flex' }}
                  >
                    {product.emoji || product.image}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="product-info-section">
            <div className="product-badges">
              {discount >= 30 && <span className="badge hot-deal">🔥 Hot Deal</span>}
              {product.inStock && product.stock < 10 && <span className="badge limited">⏰ Limited Stock</span>}
              {product.rating >= 4.5 && <span className="badge bestseller">⭐ Bestseller</span>}
            </div>
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-rating-row">
              <div className="rating-display">
                <span className="stars">{'⭐'.repeat(Math.floor(product.rating))}</span>
                <span className="rating-number">{product.rating}</span>
              </div>
              <span className="reviews-count">(2,847 ratings & 512 reviews)</span>
            </div>

            {product.seller && (
              <div className="seller-info-box">
                <div className="seller-main">
                  <span className="seller-label">Sold by:</span>
                  <button 
                    className="seller-name-link"
                    onClick={() => navigate(`/shop/${getSellerSlug(product.seller)}`)}
                  >
                    🏪 {product.seller}
                  </button>
                </div>
                <div className="seller-stats">
                  <div className="seller-stat">
                    <span className="stat-label">⭐ Seller Rating:</span>
                    <span className="stat-value">4.5/5</span>
                  </div>
                  <div className="seller-stat">
                    <span className="stat-label">📦 Products:</span>
                    <span className="stat-value">250+</span>
                  </div>
                  <div className="seller-stat">
                    <span className="stat-label">⚡ Response:</span>
                    <span className="stat-value">Within 2 hrs</span>
                  </div>
                </div>
              </div>
            )}

            <div className="price-section">
              <div className="current-price">₹{product.price.toLocaleString()}</div>
              <div className="original-price">₹{product.original.toLocaleString()}</div>
              <div className="discount-badge">{discount}% OFF</div>
            </div>

            <div className="savings-info">
              You save: ₹{(product.original - product.price).toLocaleString()}
            </div>

            <div className="stock-info">
              {product.inStock ? (
                <span className="in-stock">✅ In Stock</span>
              ) : (
                <span className="out-of-stock">❌ Out of Stock</span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="quantity-section">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="qty-display">{quantity}</span>
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                🛒 Add to Cart
              </button>
              <button 
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                ⚡ Buy Now
              </button>
              <button 
                className="chat-seller-btn"
                onClick={() => {
                  console.log('Chat button clicked', {
                    isLoggedIn,
                    userRole,
                    productId: product?.id,
                    sellerId: product?.sellerId
                  });
                  if (!isLoggedIn) {
                    setShowLoginModal(true);
                    return;
                  }
                  if (userRole !== 'customer') {
                    alert('Only customers can chat with sellers');
                    return;
                  }
                  setShowChatModal(true);
                }}
              >
                💬 Chat with Seller
              </button>
            </div>

            {/* Delivery Info */}
            <div className="delivery-info">
              <div className="delivery-item">
                <span className="delivery-icon">🚚</span>
                <div>
                  <strong>Free Delivery</strong>
                  <p>On orders above ₹999</p>
                </div>
              </div>
              <div className="delivery-item">
                <span className="delivery-icon">↩️</span>
                <div>
                  <strong>7 Days Return</strong>
                  <p>No questions asked</p>
                </div>
              </div>
              <div className="delivery-item">
                <span className="delivery-icon">✅</span>
                <div>
                  <strong>Warranty</strong>
                  <p>1 Year Manufacturer Warranty</p>
                </div>
              </div>
            </div>

            {/* Pincode Checker */}
            <div className="pincode-checker">
              <label>Check Delivery</label>
              <div className="pincode-input-group">
                <input 
                  type="text" 
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                />
                <button onClick={handlePincodeCheck}>Check</button>
              </div>
              {isPincodeValid === true && (
                <p className="pincode-result success">✅ Delivery available to this location (2-3 days)</p>
              )}
              {isPincodeValid === false && (
                <p className="pincode-result error">❌ Please enter a valid 6-digit pincode</p>
              )}
            </div>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-item">🔒 Secure Transaction</div>
              <div className="trust-item">✓ 100% Genuine Products</div>
              <div className="trust-item">💳 Easy EMI Available</div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="product-tabs">
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          <div className="tabs-content">
            {/* Description Tab */}
            <div className={`tab-panel ${activeTab === 'description' ? 'active' : ''}`}>
              <h3>Product Description</h3>
              <p>
                {product.description || `Experience the perfect blend of quality and style with ${product.name}. 
                Crafted with premium materials and designed with attention to detail, 
                this product offers exceptional value for money. Whether you're looking 
                for everyday use or special occasions, this product meets all your needs.`}
              </p>
              
              <h4>Key Features:</h4>
              <ul className="features-list">
                {features.map((feature, index) => (
                  <li key={index}>✓ {feature}</li>
                ))}
              </ul>
            </div>

            {/* Specifications Tab */}
            <div className={`tab-panel ${activeTab === 'specifications' ? 'active' : ''}`}>
              <h3>Specifications</h3>
              <table className="specs-table">
                <tbody>
                  {Object.entries(specifications).map(([key, value]) => (
                    <tr key={key}>
                      <td className="spec-label">{key}</td>
                      <td className="spec-value">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reviews Tab */}
            <div className={`tab-panel ${activeTab === 'reviews' ? 'active' : ''}`}>
              <div className="reviews-section">
                <div className="reviews-summary">
                  <h3>Customer Reviews</h3>
                  <div className="rating-breakdown">
                    <div className="overall-rating">
                      <div className="rating-score">{reviewsData.averageRating?.toFixed ? reviewsData.averageRating.toFixed(1) : reviewsData.averageRating}</div>
                      <div className="rating-stars-large">
                        {'⭐'.repeat(Math.round(reviewsData.averageRating || 0))}
                      </div>
                      <div className="total-ratings">Based on {reviewsData.totalReviews || 0} reviews</div>
                    </div>
                  </div>
                </div>

                {/* Write/Update Review */}
                <div className="write-review">
                  {/* My Reviews Section */}
                  {isLoggedIn && userRole === 'customer' && myReviews.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4>Your Reviews ({myReviews.length})</h4>
                      {myReviews.map((rev) => (
                        <div key={rev._id} className="review-card" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
                          <div className="review-header">
                            <div className="reviewer-info">
                              <div className="reviewer-name">{rev.customer?.name || 'You'}</div>
                              <div className="review-date">{new Date(rev.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div className="review-rating">{'⭐'.repeat(rev.rating)}</div>
                          </div>
                          {rev.product && (
                            <div style={{ fontSize: '0.875rem', color: '#059669', marginBottom: '0.5rem', fontWeight: 600 }}>
                              📦 Product: {rev.product.name}
                            </div>
                          )}
                          <div className="review-comment">{rev.comment}</div>
                          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                            <button
                              style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              onClick={() => {
                                setEditingReviewId(rev._id);
                                setReviewRating(rev.rating);
                                setReviewComment(rev.comment);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              onClick={async () => {
                                if (!window.confirm('Delete this review?')) return;
                                try {
                                  const token = localStorage.getItem('authToken');
                                  const res = await fetch(`http://localhost:5050/api/reviews/${rev._id}`, {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${token}` },
                                  });
                                  const json = await res.json();
                                  if (json.success) {
                                    const listRes = await fetch(`http://localhost:5050/api/reviews/product/${product.id}`);
                                    const list = await listRes.json();
                                    if (list.success) {
                                      setReviewsData(list.data);
                                      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                                      const customerReviews = (list.data.reviews || []).filter(
                                        r => r.customer?._id === userData.id || r.customer?.id === userData.id
                                      );
                                      setMyReviews(customerReviews);
                                    }
                                  } else {
                                    alert(json.message || 'Failed to delete');
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Review Form */}
                  {isLoggedIn ? (
                    userRole === 'customer' ? (
                      <form onSubmit={(e) => { e.preventDefault(); }} className="review-form">
                        <h4>{editingReviewId ? 'Edit Review' : 'Write a Review'}: {product.name}</h4>
                        <div className="form-row">
                          <label>Rating:</label>
                          <select value={reviewRating} onChange={(e) => setReviewRating(parseInt(e.target.value))} required>
                            {[1,2,3,4,5].map(r => (
                              <option key={r} value={r}>{r} Star{r>1?'s':''}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-row">
                          <label>Comment:</label>
                          <textarea
                            placeholder="Share your experience (max 500 chars)"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value.slice(0,500))}
                            maxLength={500}
                            required
                          />
                        </div>
                        <div className="form-actions">
                          <button
                            type="button"
                            disabled={submittingReview || reviewComment.trim()===''}
                            onClick={async () => {
                              try {
                                setSubmittingReview(true);
                                const token = localStorage.getItem('authToken');
                                if (!token) { setShowLoginModal(true); return; }
                                const url = editingReviewId ? `http://localhost:5050/api/reviews/${editingReviewId}` : `http://localhost:5050/api/reviews`;
                                const method = editingReviewId ? 'PUT' : 'POST';
                                const body = editingReviewId ? { rating: reviewRating, comment: reviewComment } : { productId: product.id, rating: reviewRating, comment: reviewComment };
                                const res = await fetch(url, {
                                  method,
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify(body),
                                });
                                const json = await res.json();
                                if (json.success) {
                                  setReviewRating(5);
                                  setReviewComment('');
                                  setEditingReviewId(null);
                                  // Refresh reviews
                                  const listRes = await fetch(`http://localhost:5050/api/reviews/product/${product.id}`);
                                  const list = await listRes.json();
                                  if (list.success) {
                                    setReviewsData(list.data);
                                    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                                    const customerReviews = (list.data.reviews || []).filter(
                                      r => r.customer?._id === userData.id || r.customer?.id === userData.id
                                    );
                                    setMyReviews(customerReviews);
                                  }
                                  alert(editingReviewId ? 'Review updated!' : 'Review submitted!');
                                } else {
                                  alert(json.message || 'Failed to submit review');
                                }
                              } catch (err) {
                                console.error(err);
                                alert('Something went wrong.');
                              } finally {
                                setSubmittingReview(false);
                              }
                            }}
                          >
                            {editingReviewId ? 'Update Review' : 'Submit Review'}
                          </button>
                          {editingReviewId && (
                            <button
                              type="button"
                              className="delete-review-btn"
                              disabled={submittingReview}
                              onClick={() => {
                                setEditingReviewId(null);
                                setReviewRating(5);
                                setReviewComment('');
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    ) : (
                      <div className="login-to-review">Only customers can write reviews.</div>
                    )
                  ) : (
                    <div className="login-to-review">
                      <button onClick={() => setShowLoginModal(true)}>Login to write a review</button>
                    </div>
                  )}
                </div>

                {/* Reviews List */}
                {loadingReviews ? (
                  <div className="reviews-loading">Loading reviews...</div>
                ) : (
                  <div className="reviews-list">
                    {reviews.length === 0 ? (
                      <div className="no-reviews">No reviews yet. Be the first to review!</div>
                    ) : (
                      reviews.map((review) => (
                        <div key={review._id} className="review-card">
                          <div className="review-header">
                            <div className="reviewer-info">
                              <div className="reviewer-name">
                                {review.customer?.name || 'Customer'}
                              </div>
                              <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div className="review-rating">
                              {'⭐'.repeat(review.rating)}
                            </div>
                          </div>
                          {review.product && (
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: 500 }}>
                              📦 Product: {review.product.name}
                            </div>
                          )}
                          <div className="review-comment">{review.comment}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products Section (ML-based) */}
        {similarProducts.length > 0 && (
          <div className="related-products-section">
            <h2 className="related-title">🔍 Similar Products</h2>
            <div className="related-products-grid">
              {similarProducts.map((relatedProduct) => {
                const relatedDiscount = Math.round(((relatedProduct.original - relatedProduct.price) / relatedProduct.original) * 100);
                return (
                  <div 
                    key={relatedProduct.id} 
                    className="related-product-card"
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate(`/product/${relatedProduct.id}`);
                    }}
                  >
                    <div className="related-product-image">
                      {relatedProduct.images && relatedProduct.images.length > 0 && (
                        <img 
                          src={relatedProduct.images[0]} 
                          alt={relatedProduct.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      )}
                      <span 
                        className="related-product-emoji"
                        style={{ 
                          display: (relatedProduct.images && relatedProduct.images.length > 0) ? 'none' : 'flex'
                        }}
                      >
                        {relatedProduct.emoji || relatedProduct.image}
                      </span>
                    </div>
                    <div className="related-product-info">
                      <h4 className="related-product-name">{relatedProduct.name}</h4>
                      <div className="related-product-rating">
                        <span className="stars">{'⭐'.repeat(Math.floor(relatedProduct.rating))}</span>
                        <span className="rating-num">{relatedProduct.rating.toFixed(1)}</span>
                      </div>
                      <div className="related-product-price">
                        <span className="current">₹{relatedProduct.price.toLocaleString()}</span>
                        <span className="original">₹{relatedProduct.original.toLocaleString()}</span>
                        <span className="discount">{relatedDiscount}% OFF</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Related Products Section (Category-based fallback) */}
        {similarProducts.length === 0 && relatedProducts.length > 0 && (
          <div className="related-products-section">
            <h2 className="related-title">You May Also Like</h2>
            <div className="related-products-grid">
              {relatedProducts.map((relatedProduct) => {
                const relatedDiscount = Math.round(((relatedProduct.original - relatedProduct.price) / relatedProduct.original) * 100);
                return (
                  <div 
                    key={relatedProduct.id} 
                    className="related-product-card"
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate(`/product/${relatedProduct.id}`);
                    }}
                  >
                    <div className="related-product-image">
                      {relatedProduct.image || relatedProduct.emoji}
                    </div>
                    <div className="related-product-info">
                      <h4 className="related-product-name">{relatedProduct.name}</h4>
                      <div className="related-product-rating">
                        <span className="stars">{'⭐'.repeat(Math.floor(relatedProduct.rating))}</span>
                        <span className="rating-num">{relatedProduct.rating}</span>
                      </div>
                      <div className="related-product-price">
                        <span className="current">₹{relatedProduct.price.toLocaleString()}</span>
                        <span className="original">₹{relatedProduct.original.toLocaleString()}</span>
                        <span className="discount">{relatedDiscount}% OFF</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={onLoginSuccess}
      />

      {showChatModal && product && product.sellerId && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          product={product}
          sellerId={product.sellerId}
        />
      )}
    </div>
  );
};

export default ProductDetailsPage;
