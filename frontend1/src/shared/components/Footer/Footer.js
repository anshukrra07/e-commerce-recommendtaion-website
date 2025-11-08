import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About S-E-Com</h3>
            <a href="/about">About Us</a>
            <a href="/careers">Careers</a>
            <a href="/press">Press</a>
          </div>
          <div className="footer-section">
            <h3>Customer Service</h3>
            <a href="/help">Help Center</a>
            <a href="/track-order">Track Order</a>
            <a href="/returns">Returns</a>
          </div>
          <div className="footer-section">
            <h3>Sell With Us</h3>
            <a href="/become-seller">Become a Seller</a>
            <a href="/seller/dashboard">Seller Dashboard</a>
            <a href="/seller/policy">Seller Policy</a>
          </div>
          <div className="footer-section">
            <h3>Connect</h3>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 S-E-Com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
