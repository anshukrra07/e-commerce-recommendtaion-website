import React, { useState } from 'react';
import './SignupModal.css';

function SignupModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Seller specific
    businessName: '',
    businessAddress: '',
    gstNumber: '',
    bankAccount: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (activeTab === 'customer') {
      alert(`Customer account created for ${formData.email}!\nYou can now login.`);
    } else {
      alert(`Seller registration submitted for ${formData.businessName}!\n\nYour account is pending admin approval. You will receive an email once approved.`);
    }
    
    onClose();
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      businessName: '',
      businessAddress: '',
      gstNumber: '',
      bankAccount: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="signup-modal-overlay" onClick={onClose}>
      <div className="signup-modal" onClick={(e) => e.stopPropagation()}>
        <button className="signup-modal-close" onClick={onClose}>×</button>
        
        <h2>Create Account</h2>
        
        <div className="signup-tabs">
          <button
            className={`signup-tab ${activeTab === 'customer' ? 'active' : ''}`}
            onClick={() => setActiveTab('customer')}
          >
            👤 Customer
          </button>
          <button
            className={`signup-tab ${activeTab === 'seller' ? 'active' : ''}`}
            onClick={() => setActiveTab('seller')}
          >
            🏪 Seller
          </button>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {activeTab === 'customer' ? (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>

              <button type="submit" className="signup-submit-btn customer">
                Create Customer Account
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  placeholder="Enter your business name"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Owner Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter owner's full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Business email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Business phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Business Address</label>
                <textarea
                  name="businessAddress"
                  placeholder="Enter complete business address"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  required
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  placeholder="Enter GST registration number"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Bank Account Number</label>
                <input
                  type="text"
                  name="bankAccount"
                  placeholder="Enter bank account number"
                  value={formData.bankAccount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>

              <div className="seller-note">
                ⚠️ Your seller account will be reviewed by admin before activation
              </div>

              <button type="submit" className="signup-submit-btn seller">
                Submit for Admin Approval
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default SignupModal;
