import React, { useState, useEffect, useRef } from 'react';
import './ChatModal.css';
import { API_BASE_URL } from '../../../utils/environment.js';
const API_URL = API_BASE_URL;

const ChatModal = ({ isOpen, onClose, product, sellerId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Check auth from localStorage
  const token = localStorage.getItem('authToken');
  const isLoggedIn = !!token;

  // Debug logging
  console.log('ChatModal props:', { 
    isOpen, 
    productId: product?.id, 
    productName: product?.name,
    sellerId,
    hasToken: !!token 
  });

  const fetchConversation = async () => {
    if (!token || !product?.id || !sellerId) return;
    
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/chat/conversation/${product.id}/${sellerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setMessages(data.data);
        // Mark as read
        await fetch(`${API_URL}/chat/mark-read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId: product.id, otherUserId: sellerId })
        });
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch conversation
  useEffect(() => {
    if (isOpen && product?.id && sellerId && isLoggedIn && 
        product.id !== 'undefined' && sellerId !== 'undefined') {
      fetchConversation();
      // Poll for new messages every 5 seconds
      const interval = setInterval(fetchConversation, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product?.id, sellerId, isLoggedIn]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !token || !product?.id || !sellerId) return;

    try {
      setSending(true);

      const res = await fetch(`${API_URL}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          receiverId: sellerId,
          message: newMessage
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages([...messages, data.data]);
        setNewMessage('');
      } else {
        alert(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  // Don't render if missing required data
  if (!product || !product.id || !sellerId || product.id === 'undefined' || sellerId === 'undefined') {
    return (
      <div className="chat-modal-overlay" onClick={onClose}>
        <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
          <div className="chat-header">
            <div className="chat-product-info">
              <div>
                <h4>Error</h4>
                <p>Unable to load chat. Product or seller information missing.</p>
              </div>
            </div>
            <button className="chat-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <div className="chat-product-info">
            <div className="chat-product-image">{product.emoji || product.image}</div>
            <div>
              <h4>Chat about: {product.name}</h4>
              <p>Seller: {product.seller}</p>
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="chat-messages">
          {loading && messages.length === 0 ? (
            <div className="chat-loading">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <p>👋 Start a conversation!</p>
              <p className="chat-empty-hint">Ask the seller about this product</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg._id || idx}
                className={`chat-message ${msg.sender === 'customer' ? 'sent' : 'received'}`}
              >
                <div className="message-bubble">
                  <p>{msg.message}</p>
                  <span className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSend}>
          <input
            type="text"
            className="chat-input"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            maxLength={1000}
            disabled={sending || !isLoggedIn}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={sending || !newMessage.trim() || !isLoggedIn}
          >
            {sending ? '...' : '📤'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
