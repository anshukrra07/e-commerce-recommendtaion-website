import React, { useState, useEffect } from 'react';
import Header from '../shared/components/Header/Header';
import CategoryNav from '../shared/components/CategoryNav/CategoryNav';
import Footer from '../shared/components/Footer/Footer';
import Carousel from '../shared/components/Carousel/Carousel';
import ProductSection from '../shared/components/ProductSection/ProductSection';
import LoginModal from '../shared/components/LoginModal/LoginModal';
import ChatbotButton from '../shared/components/ChatbotButton/ChatbotButton';
import ChatbotModal from '../shared/components/ChatbotModal/ChatbotModal';
import { API_BASE_URL } from '../utils/environment.js';

const HomePage = ({ isLoggedIn, userName, userRole, onLoginSuccess, onLogout }) => {
  const [cartCount, setCartCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch approved products and active banners from API
  useEffect(() => {
    fetchProducts();
    fetchBanners();
    fetchRecommendations();
  }, [isLoggedIn, userRole]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      } else {
        console.error('Failed to fetch products:', data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/banners/active?position=homepage-top`);
      const data = await response.json();

      if (data.success) {
        // Transform banners to carousel slides format
        const slides = data.data.map(banner => ({
          id: banner._id,
          title: banner.title,
          subtitle: banner.subtitle,
          image: banner.image,
          backgroundColor: banner.backgroundColor,
          backgroundColorEnd: banner.backgroundColorEnd,
          textColor: banner.textColor,
          buttonText: banner.buttonText,
          link: banner.buttonLink
        }));
        console.log('🎨 Banner slides with gradient colors:', slides);
        setBanners(slides);

        // Track impressions for each banner
        data.data.forEach(banner => {
          fetch(`${API_BASE_URL}/banners/${banner._id}/impression`, { method: 'POST' })
            .catch(err => console.error('Failed to track impression:', err));
        });
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      if (isLoggedIn && userRole === 'customer') {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.id) {
          const response = await fetch(`${API_BASE_URL}/recommendations/${userData.id}?limit=10`);
          const data = await response.json();
          
          if (data.success && data.products) {
            setRecommendations(data.products);
            console.log('🎯 Recommendations loaded:', data.source, data.products.length);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  // Categorize products
  const categorizeProducts = () => {
    const electronics = products.filter(p => p.category === 'electronics');
    const clothing = products.filter(p => p.category === 'clothing');
    const footwear = products.filter(p => p.category === 'footwear');
    const accessories = products.filter(p => p.category === 'accessories');
    const homeDecor = products.filter(p => p.category === 'home-decor');
    
    // Trending: products with high rating or discount
    const trending = products
      .filter(p => p.discount > 20 || p.sold > 100)
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 10);

    return { electronics, clothing, footwear, accessories, homeDecor, trending };
  };

  const categorized = categorizeProducts();

  const handleAddToCart = (product) => {
    setCartCount(cartCount + 1);
    alert(`Added ${product.name} to cart!`);
  };

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
        <CategoryNav />
        <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h2>Loading Products...</h2>
        </div>
      </div>
    );
  }

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
      <CategoryNav />

      {banners.length > 0 && <Carousel slides={banners} />}

      <div className="container">
        {/* Personalized Recommendations - Only for logged in customers */}
        {isLoggedIn && userRole === 'customer' && recommendations.length > 0 && (
          <div id="recommendations" style={{ marginBottom: '2rem' }}>
            <ProductSection
              title="🎯 Recommended for You"
              products={recommendations}
              category="Recommended"
              categoryId="recommendations"
              onAddToCart={handleAddToCart}
              gradient="linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)"
            />
          </div>
        )}

        {/* Trending Section */}
        {categorized.trending.length > 0 && (
          <div id="trending" style={{ marginBottom: '2rem' }}>
            <ProductSection
              title="🔥 Trending Now"
              products={categorized.trending}
              category="Trending"
              categoryId="trending"
              onAddToCart={handleAddToCart}
              gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            />
          </div>
        )}

        {/* Electronics Section */}
        {categorized.electronics.length > 0 && (
          <div id="electronics">
            <ProductSection
              title="📱 Electronics"
              products={categorized.electronics}
              category="Electronics"
              categoryId="electronics"
              onAddToCart={handleAddToCart}
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
          </div>
        )}

        {/* Clothing Section */}
        {categorized.clothing.length > 0 && (
          <div id="clothing">
            <ProductSection
              title="👕 Fashion & Clothing"
              products={categorized.clothing}
              category="Clothing"
              categoryId="clothing"
              onAddToCart={handleAddToCart}
              gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            />
          </div>
        )}

        {/* Footwear Section */}
        {categorized.footwear.length > 0 && (
          <div id="footwear">
            <ProductSection
              title="👟 Footwear"
              products={categorized.footwear}
              category="Footwear"
              categoryId="footwear"
              onAddToCart={handleAddToCart}
              gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            />
          </div>
        )}

        {/* Accessories Section */}
        {categorized.accessories.length > 0 && (
          <div id="accessories">
            <ProductSection
              title="👜 Accessories"
              products={categorized.accessories}
              category="Accessories"
              categoryId="accessories"
              onAddToCart={handleAddToCart}
              gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            />
          </div>
        )}

        {/* Home Decor Section */}
        {categorized.homeDecor.length > 0 && (
          <div id="home-decor">
            <ProductSection
              title="🏠 Home & Decor"
              products={categorized.homeDecor}
              category="Home Decor"
              categoryId="home-decor"
              onAddToCart={handleAddToCart}
              gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            />
          </div>
        )}

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📦</div>
            <h2>No Products Available</h2>
            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Check back soon for new products!</p>
          </div>
        )}
      </div>

      <Footer />

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={onLoginSuccess}
      />

      {/* Chatbot */}
      <ChatbotButton onClick={() => setShowChatbot(true)} />
      <ChatbotModal isOpen={showChatbot} onClose={() => setShowChatbot(false)} />
    </div>
  );
};

export default HomePage;
