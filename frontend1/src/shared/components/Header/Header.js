import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ onLoginClick, isLoggedIn = false, userName = 'User', userRole = 'customer', onLogout }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [compareCount, setCompareCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searching, setSearching] = useState(false);

  // Read compare and cart counts from localStorage
  useEffect(() => {
    const updateCounts = () => {
      const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
      const cartList = JSON.parse(localStorage.getItem('cartList') || '[]');
      setCompareCount(compareList.length);
      setCartCount(cartList.reduce((sum, item) => sum + (item.quantity || 1), 0));
    };
    
    updateCounts();
    
    // Listen for storage changes
    window.addEventListener('storage', updateCounts);
    window.addEventListener('compareListUpdated', updateCounts);
    window.addEventListener('cartListUpdated', updateCounts);
    window.addEventListener('wishListUpdated', updateCounts);
    
    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('compareListUpdated', updateCounts);
      window.removeEventListener('cartListUpdated', updateCounts);
      window.removeEventListener('wishListUpdated', updateCounts);
    };
  }, []);
  
  // Debug: Log received props
  console.log('Header received props - isLoggedIn:', isLoggedIn, 'userName:', userName, 'userRole:', userRole);

  const handleLogout = () => {
    setShowDropdown(false);
    if (onLogout) {
      onLogout();
    }
  };

  // Search handler with debounce
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          setSearching(true);
          const response = await fetch(`http://localhost:5050/api/search?q=${encodeURIComponent(searchQuery)}`);
          const data = await response.json();
          
          if (data.success) {
            const combined = [
              ...data.results.map(p => ({ ...p, type: 'match' })),
              ...data.similar.map(p => ({ ...p, type: 'similar' }))
            ];
            setSearchResults(combined);
            setShowSearchResults(true);
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      navigate(`/product/${searchResults[0]._id}`);
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowSearchResults(false);
    setSearchQuery('');
  };
  
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <a href="/" className="logo">
            🛒 S-E-Com
          </a>

          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search for products, brands and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
            />
            <button className="search-btn" onClick={() => searchResults.length > 0 && handleProductClick(searchResults[0]._id)}>
              {searching ? '⏳' : '🔍'}
            </button>
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results-dropdown">
                <div className="search-results-list">
                  {searchResults.slice(0, 8).map((product) => (
                    <div
                      key={product._id}
                      className="search-result-item"
                      onClick={() => handleProductClick(product._id)}
                    >
                      <div className="result-image">
                        {product.images && product.images.length > 0 && product.images[0].startsWith('http') && (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        )}
                        <span 
                          className="result-emoji"
                          style={{ display: (product.images && product.images.length > 0 && product.images[0].startsWith('http')) ? 'none' : 'flex' }}
                        >
                          {product.image}
                        </span>
                      </div>
                      <div className="result-info">
                        <div className="result-name">{product.name}</div>
                        <div className="result-price">₹{product.price?.toLocaleString()}</div>
                        {product.type === 'similar' && (
                          <span className="similar-badge">Similar</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {searchResults.length > 8 && (
                  <div className="search-results-footer">
                    +{searchResults.length - 8} more results
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="nav-actions">
            {userRole === 'admin' && (
              <a href="/admin" className="admin-link" title="Admin Dashboard">
                🛡️
              </a>
            )}
            {userRole === 'seller' && (
              <a href="/seller" className="seller-link" title="Seller Dashboard">
                🏪
              </a>
            )}
            <button 
              className="compare-btn" 
              onClick={() => {
                const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
                if (compareList.length === 0) {
                  alert('No products added to comparison!');
                  return;
                }
                navigate(`/compare?ids=${compareList.join(',')}`);
              }} 
              title="Compare Products"
            >
              ⚖️
              {compareCount > 0 && <span className="compare-count">{compareCount}</span>}
            </button>
            <button className="cart-btn" onClick={() => navigate('/cart')}>
              🛒
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
            {isLoggedIn ? (
              <div className="user-profile">
                <button className="user-btn" onClick={() => setShowDropdown(!showDropdown)}>
                  <span className="user-icon">
                    {userRole === 'admin' ? '🛡️' : userRole === 'seller' ? '🏪' : '👤'}
                  </span>
                  <span className="user-name">{userName}</span>
                  <span className="user-role">({userRole})</span>
                </button>
                {showDropdown && (
                  <div className="user-dropdown">
                    <div className="dropdown-item user-info">
                      <strong>{userName}</strong>
                      <span className="role-badge">{userRole}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    {userRole === 'customer' && (
                      <button className="dropdown-item" onClick={() => { setShowDropdown(false); navigate('/orders'); }}>
                        📦 My Orders
                      </button>
                    )}
                    {userRole === 'seller' && (
                      <button className="dropdown-item" onClick={() => { setShowDropdown(false); navigate('/seller'); }}>
                        🏪 My Dashboard
                      </button>
                    )}
                    {userRole === 'admin' && (
                      <button className="dropdown-item" onClick={() => { setShowDropdown(false); navigate('/admin'); }}>
                        🛡️ Admin Dashboard
                      </button>
                    )}
                    <button className="dropdown-item" onClick={handleLogout}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="nav-btn primary" onClick={onLoginClick}>
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
