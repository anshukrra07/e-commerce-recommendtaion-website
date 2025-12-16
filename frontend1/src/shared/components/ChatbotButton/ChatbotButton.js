import React from 'react';
import './ChatbotButton.css';

const ChatbotButton = ({ onClick }) => {
  return (
    <button className="chatbot-button" onClick={onClick} title="Chat with our shopping assistant">
      <span className="chatbot-button-icon">💬</span>
    </button>
  );
};

export default ChatbotButton;
