import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoryNav.css';

const CategoryNav = () => {
  const navigate = useNavigate();
  
  const categories = [
    { id: 'electronics', name: 'Electronics', icon: '📱', color: '#667eea' },
    { id: 'clothing', name: 'Fashion & Clothing', icon: '👕', color: '#f093fb' },
    { id: 'footwear', name: 'Footwear', icon: '👟', color: '#4facfe' },
    { id: 'accessories', name: 'Accessories', icon: '👜', color: '#43e97b' },
    { id: 'home-decor', name: 'Home & Decor', icon: '🏠', color: '#fa709a' },
  ];

  const handleCategoryClick = (categoryId) => {
    navigate(`/products/${categoryId}`);
  };

  return (
    <nav className="category-nav">
      <div className="container">
        <div className="category-nav-content">
          <div className="category-label">
            <span className="category-icon">🛍️</span>
            <span>Shop by Category</span>
          </div>
          <div className="category-list">
            {categories.map((category) => (
              <button
                key={category.id}
                className="category-item"
                onClick={() => handleCategoryClick(category.id)}
                style={{ '--category-color': category.color }}
              >
                <span className="category-emoji">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
