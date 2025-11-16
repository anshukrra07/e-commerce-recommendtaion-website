import React, { useState, useEffect } from 'react';
import './Carousel.css';
import { API_BASE_URL } from '../../../utils/environment.js';

const Carousel = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleBannerClick = (slide) => {
    // Track click
    if (slide.id) {
      fetch(`${API_BASE_URL}/banners/${slide.id}/click`, { method: 'POST' })
        .catch(err => console.error('Failed to track click:', err));
    }

    // Navigate to link
    if (slide.link) {
      window.location.href = slide.link;
    }
  };

  if (slides.length === 0) return null;

  console.log('🎪 Carousel rendering slides:', slides);

  return (
    <div className="carousel">
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => {
          const bgImage = slide.image 
            ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${slide.image})`
            : slide.backgroundColorEnd
              ? `linear-gradient(135deg, ${slide.backgroundColor} 0%, ${slide.backgroundColorEnd} 100%)`
              : `linear-gradient(135deg, ${slide.backgroundColor || slide.bg} 0%, ${slide.backgroundColor || slide.bg}dd 100%)`;
          
          console.log(`🎨 Slide ${index}:`, {
            title: slide.title,
            hasImage: !!slide.image,
            image: slide.image,
            backgroundColor: slide.backgroundColor,
            backgroundColorEnd: slide.backgroundColorEnd,
            computedBackground: bgImage
          });
          
          return (
          <div
            key={slide.id || index}
            className="carousel-slide"
            style={{
              backgroundImage: bgImage,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: slide.textColor || '#ffffff'
            }}
          >
            {/* Hot Deal Badge */}
            <div className="slide-badge">
              🔥 HOT DEAL
            </div>
            
            <div className="slide-content">
              <h2 style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.4)' }}>{slide.title}</h2>
              <p style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}>{slide.subtitle || slide.description}</p>
              <button 
                className="slide-btn"
                onClick={() => handleBannerClick(slide)}
              >
                {slide.buttonText || 'Shop Now'} →
              </button>
            </div>
          </div>
          );
        })}
      </div>

      <button className="carousel-arrow left" onClick={prevSlide}>
        ‹
      </button>
      <button className="carousel-arrow right" onClick={nextSlide}>
        ›
      </button>

      <div className="carousel-nav">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
