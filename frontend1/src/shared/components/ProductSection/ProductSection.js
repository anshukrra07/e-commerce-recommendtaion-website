import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard';
import './ProductSection.css';

const ProductSection = ({ title, products, category, onAddToCart, gradient, categoryId }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  
  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300; // Scroll by 300px
      const newScrollPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <section className="section">
      <div className="section-header" style={{ background: gradient }}>
        <h2 className="section-title">{title}</h2>
        <button className="view-all" onClick={() => navigate(`/products/${categoryId}`)}>
          View All →
        </button>
      </div>
      <div className="product-grid-wrapper">
        <button 
          className="scroll-btn scroll-btn-left" 
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          ‹
        </button>
        <div className="product-grid" ref={scrollContainerRef}>
          {products.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={{
                ...product,
                id: product._id || product.id,
                original: product.discount > 0 ? Math.round(product.price / (1 - product.discount / 100)) : product.price,
                emoji: product.image,
                seller: typeof product.seller === 'object' ? product.seller?.businessName : product.seller,
                inStock: product.stock > 0,
                reviews: product.sold || 0
              }}
              category={category}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
        <button 
          className="scroll-btn scroll-btn-right" 
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </section>
  );
};

export default ProductSection;
