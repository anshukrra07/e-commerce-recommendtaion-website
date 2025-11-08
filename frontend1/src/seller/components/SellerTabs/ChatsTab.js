import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5050/api';

/**
 * ChatsTab Component
 * Displays all customer conversations grouped by product and customer
 * Shows unread message counts and allows replying to messages
 */
const ChatsTab = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const res = await fetch(`${API_URL}/chat/seller/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        const list = Array.isArray(data.data) ? data.data : [];
        setConversations(list);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    const { productId, customerId } = selectedChat || {};
    if (!productId || !customerId || productId === 'undefined' || customerId === 'undefined') return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const res = await fetch(
        `${API_URL}/chat/conversation/${productId}/${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
          body: JSON.stringify({
            productId,
            otherUserId: customerId
          })
        });
        // Refresh conversation list to update unread counts
        fetchConversations();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    const { productId, customerId } = selectedChat || {};
    if (!productId || !customerId || productId === 'undefined' || customerId === 'undefined') return;

    try {
      setSending(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const res = await fetch(`${API_URL}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          receiverId: customerId,
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

  // Fetch all seller conversations
  useEffect(() => {
    fetchConversations();
    // Poll every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      // Poll messages every 5 seconds when chat is open
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  if (loading) {
    return (
      <div className="chats-tab">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chats-tab">
      <div className="chats-container">
        {/* Conversations List */}
        <div className="conversations-sidebar">
          <div className="conversations-header">
            <h3>💬 Customer Messages</h3>
            <span className="total-count">{conversations.length} conversations</span>
            <button
              style={{ marginLeft: 'auto' }}
              onClick={async () => {
                const token = localStorage.getItem('authToken');
                if (!token) return;
                if (!window.confirm('Clean up chats linked to removed products/customers?')) return;
                try {
                  await fetch(`${API_URL}/chat/seller/cleanup`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  fetchConversations();
                } catch (e) {
                  console.error('Cleanup failed', e);
                }
              }}
              className="cleanup-btn"
            >
              🧹 Clean Up
            </button>
          </div>

          {conversations.length === 0 ? (
            <div className="empty-conversations">
              <p>📭 No messages yet</p>
              <span>Customer messages will appear here</span>
            </div>
          ) : (
            <div className="conversations-list">
              {conversations.map((conv, idx) => (
                <div
                  key={`${conv.productId || 'na'}-${conv.customerId || 'na'}-${idx}`}
                  className={`conversation-item ${
                    selectedChat?.productId === conv.productId &&
                    selectedChat?.customerId === conv.customerId
                      ? 'active'
                      : ''
                  } ${(!conv.productId || !conv.customerId) ? 'disabled' : ''}`}
                  onClick={() => {
                    if (!conv.productId || !conv.customerId) {
                      alert('This conversation is linked to a removed product or customer and cannot be opened.');
                      return;
                    }
                    setSelectedChat({
                      productId: conv.productId,
                      customerId: conv.customerId,
                      customerName: conv.customerName || 'Unknown Customer',
                      productName: conv.productName || 'Unknown Product'
                    });
                  }}
                >
                  <div className="conversation-avatar">
                    {conv.customerName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-customer">{conv.customerName || 'Unknown Customer'}</div>
                    <div className="conversation-product">📦 {conv.productName || 'Unknown Product'}</div>
                    {(!conv.productId || !conv.customerId) && (
                      <div style={{ color: '#b91c1c', fontSize: '12px', marginTop: '2px' }}>
                        Cannot open: missing reference
                      </div>
                    )}
                    <div className="conversation-preview">{conv.lastMessage}</div>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="unread-badge">{conv.unreadCount}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          {selectedChat ? (
            <>
              <div className="chat-window-header">
                <div>
                  <h4>{selectedChat.customerName}</h4>
                  <p>Product: {selectedChat.productName}</p>
                </div>
              </div>

              <div className="chat-messages-area">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={msg._id || idx}
                      className={`chat-message ${msg.sender === 'seller' ? 'sent' : 'received'}`}
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
              </div>

              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type your reply..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  maxLength={1000}
                  disabled={sending}
                />
                <button type="submit" disabled={sending || !newMessage.trim()}>
                  {sending ? '...' : '📤 Send'}
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <p>👈 Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatsTab;
