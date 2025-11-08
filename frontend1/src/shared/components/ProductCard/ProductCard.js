import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, category, onAddToCart }) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(() => {
    const wishList = JSON.parse(localStorage.getItem('wishList') || '[]');
    return wishList.includes(product.id);
  });
  const [isComparing, setIsComparing] = useState(() => {
    const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
    return compareList.includes(product.id);
  });
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);

  const handleSellerClick = (e) => {
    e.stopPropagation();
    // Use seller._id if available (populated), otherwise use product.seller if it's an ID
    const sellerId = product.seller?._id || product.seller;
    if (sellerId) {
      navigate(`/shop/${sellerId}`);
    }
  };

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    
    // Get current wishlist from localStorage
    const wishList = JSON.parse(localStorage.getItem('wishList') || '[]');
    
    if (isWishlisted) {
      // Remove from wishlist
      const updated = wishList.filter(id => id !== product.id);
      localStorage.setItem('wishList', JSON.stringify(updated));
      setIsWishlisted(false);
      setShowTooltip('wishlist-remove');
    } else {
      // Add to wishlist
      const updated = [...wishList, product.id];
      localStorage.setItem('wishList', JSON.stringify(updated));
      setIsWishlisted(true);
      setShowTooltip('wishlist-add');
    }
    
    // Dispatch event to update other components
    window.dispatchEvent(new Event('wishListUpdated'));
    setTimeout(() => setShowTooltip(null), 2000);
  };

  const handleCompare = (e) => {
    e.stopPropagation();
    
    // Get current compare list from localStorage
    const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
    
    if (isComparing) {
      // Remove from compare
      const updated = compareList.filter(id => id !== product.id);
      localStorage.setItem('compareList', JSON.stringify(updated));
      setIsComparing(false);
      setShowTooltip('compare-remove');
      // Dispatch event to update header count
      window.dispatchEvent(new Event('compareListUpdated'));
    } else {
      // Add to compare (limit to 4 items)
      if (compareList.length >= 4) {
        alert('You can compare maximum 4 products at once!');
        return;
      }
      const updated = [...compareList, product.id];
      localStorage.setItem('compareList', JSON.stringify(updated));
      setIsComparing(true);
      setShowTooltip('compare-add');
      // Dispatch event to update header count
      window.dispatchEvent(new Event('compareListUpdated'));
    }
    
    setTimeout(() => setShowTooltip(null), 2000);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsAddingToCart(true);
    
    // Add to cart in localStorage
    const cartList = JSON.parse(localStorage.getItem('cartList') || '[]');
    const existing = cartList.find(item => item.id === product.id);
    
    if (existing) {
      // Increase quantity
      const updated = cartList.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      localStorage.setItem('cartList', JSON.stringify(updated));
    } else {
      // Add new item
      const updated = [...cartList, { id: product.id, quantity: 1 }];
      localStorage.setItem('cartList', JSON.stringify(updated));
    }
    
    // Dispatch event to update header cart count
    window.dispatchEvent(new Event('cartListUpdated'));
    
    if (onAddToCart) onAddToCart(product);
    setShowTooltip('cart-add');
    setTimeout(() => {
      setIsAddingToCart(false);
      setShowTooltip(null);
    }, 1500);
  };

  const calculateDiscount = () => {
    if (product.original && product.price) {
      return Math.round(((product.original - product.price) / product.original) * 100);
    }
    return 0;
  };

  const discount = calculateDiscount();

  return (
    <div className="product-card" onClick={handleProductClick}>
      {/* Tooltip */}
      {showTooltip && (
        <div className={`card-tooltip ${showTooltip}`}>
          {showTooltip === 'wishlist-add' && '❤️ Added to Wishlist'}
          {showTooltip === 'wishlist-remove' && '💔 Removed from Wishlist'}
          {showTooltip === 'compare-add' && '⚖️ Added to Compare'}
          {showTooltip === 'compare-remove' && '✖️ Removed from Compare'}
          {showTooltip === 'cart-add' && '🛒 Added to Cart'}
        </div>
      )}

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="discount-badge">
          {discount}% OFF
        </div>
      )}

      <div className="product-image">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="product-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        ) : null}
        <span className="product-emoji" style={{ display: product.images && product.images.length > 0 ? 'none' : 'block' }}>
          {product.image || product.emoji}
        </span>
        <div className="product-actions">
          <button 
            className={`action-icon wishlist-icon ${isWishlisted ? 'active' : ''}`}
            onClick={handleWishlist}
            title="Add to Wishlist"
            aria-label="Add to Wishlist"
          >
            {isWishlisted ? '❤️' : '🤍'}
          </button>
          <button 
            className={`action-icon compare-icon ${isComparing ? 'active' : ''}`}
            onClick={handleCompare}
            title="Add to Compare"
            aria-label="Add to Compare"
          >
            ⚖️
          </button>
        </div>
      </div>
      <div className="product-info">
        <div className="product-header">
          <span className="product-category">{category}</span>
          {product.inStock === false && (
            <span className="stock-badge out-of-stock">Out of Stock</span>
          )}
          {product.inStock !== false && product.stock < 10 && (
            <span className="stock-badge low-stock">Only {product.stock} left</span>
          )}
        </div>
        
        <h3 className="product-name" title={product.name}>{product.name}</h3>
        
        {product.seller && (
          <div className="product-seller" onClick={handleSellerClick}>
            <span className="seller-icon">🏪</span>
            <span className="seller-name">{product.seller?.businessName || product.seller}</span>
            <span className="verified-badge" title="Verified Seller">✓</span>
          </div>
        )}
        
        <div className="product-rating">
          <div className="stars">
            {'⭐'.repeat(Math.floor(product.rating))}
            {product.rating % 1 !== 0 && '½'}
          </div>
          <span className="rating-text">{product.rating}</span>
          <span className="rating-count">({product.reviews || '0'} reviews)</span>
        </div>
        
        <div className="product-price-section">
          <div className="price-row">
            <span className="product-price">₹{product.price?.toLocaleString()}</span>
            {product.original && product.original > product.price && (
              <span className="original-price">₹{product.original?.toLocaleString()}</span>
            )}
          </div>
          {discount > 0 && (
            <span className="savings-text">Save ₹{(product.original - product.price)?.toLocaleString()}</span>
          )}
        </div>
        
        <button 
          className={`add-to-cart ${isAddingToCart ? 'adding' : ''} ${product.inStock === false ? 'disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={product.inStock === false || isAddingToCart}
        >
          {isAddingToCart ? (
            <>
              <span className="spinner"></span>
              Adding...
            </>
          ) : product.inStock === false ? (
            '❌ Out of Stock'
          ) : (
            <>
              🛒 Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
