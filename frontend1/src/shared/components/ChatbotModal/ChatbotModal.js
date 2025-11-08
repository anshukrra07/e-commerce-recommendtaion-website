import React, { useState, useRef, useEffect } from 'react';
import './ChatbotModal.css';

const ChatbotModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your shopping assistant. I can help you find products, answer questions about shipping, returns, and more! Try asking me something like "Show me cheap footwear" or "Best phone under 10000".'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, products]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setProducts([]); // Clear previous products

    try {
      const response = await fetch('http://localhost:5050/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages.slice(-4) // Last 4 messages for context
        })
      });

      const data = await response.json();

      if (data.success) {
        // Add bot response
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);

        // Show products if any
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response || 'Sorry, something went wrong. Please try again.'
        }]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '😕 Oops! I\'m having trouble connecting. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleProductClick = (productId) => {
    window.location.href = `/product/${productId}`;
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            <div className="chatbot-icon">🤖</div>
            <div>
              <h3>Shopping Assistant</h3>
              <p className="chatbot-status">Online</p>
            </div>
          </div>
          <button className="chatbot-close" onClick={onClose}>✕</button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))}

          {/* Products Grid */}
          {products.length > 0 && (
            <div className="chatbot-products">
              <div className="products-grid">
                {products.map(product => (
                  <div
                    key={product._id}
                    className="product-card"
                    onClick={() => handleProductClick(product._id)}
                  >
                    <div className="product-image-container">
                      {(() => {
                        const imageUrl = product.images?.[0] || product.image;
                        const isValidImage = imageUrl && !imageUrl.match(/^[\u{1F000}-\u{1F9FF}]/u) && imageUrl.length > 5;
                        
                        if (isValidImage) {
                          return (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.querySelector('.product-emoji-fallback').style.display = 'flex';
                              }}
                            />
                          );
                        }
                        return null;
                      })()}
                      <div 
                        className="product-emoji-fallback" 
                        style={{ 
                          display: (() => {
                            const imageUrl = product.images?.[0] || product.image;
                            const isValidImage = imageUrl && !imageUrl.match(/^[\u{1F000}-\u{1F9FF}]/u) && imageUrl.length > 5;
                            return isValidImage ? 'none' : 'flex';
                          })()
                        }}
                      >
                        {product.category === 'electronics' && '📱'}
                        {product.category === 'clothing' && '👕'}
                        {product.category === 'footwear' && '👟'}
                        {product.category === 'accessories' && '👜'}
                        {product.category === 'home-decor' && '🏠'}
                        {!['electronics', 'clothing', 'footwear', 'accessories', 'home-decor'].includes(product.category) && '📦'}
                      </div>
                      {product.discount > 0 && (
                        <div className="product-discount-badge">{product.discount}% OFF</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h4 title={product.name}>{product.name}</h4>
                      <div className="product-price">
                        {product.discount > 0 ? (
                          <>
                            <span className="discounted-price">
                              ₹{Math.round(product.price * (1 - product.discount / 100))}
                            </span>
                            <span className="original-price">₹{product.price}</span>
                          </>
                        ) : (
                          <span className="price">₹{product.price}</span>
                        )}
                      </div>
                      <p className="product-seller">By {product.seller || 'Unknown'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="message assistant">
              <div className="message-content typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chatbot-input-container">
          <textarea
            className="chatbot-input"
            placeholder="Ask me anything... (e.g., 'cheap laptops under 30000')"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows="1"
            disabled={isLoading}
          />
          <button
            className="chatbot-send"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotModal;
