import React, { useState, useEffect } from 'react';
import './LoginModal.css';

const API_BASE_URL = 'http://localhost:5050/api';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [loginType, setLoginType] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    ownerName: '',
    businessName: '',
    businessAddress: '',
    gstNumber: ''
  });

  // Reset modal state when it opens/closes
  useEffect(() => {
    if (!isOpen) {
      setMode('login');
      setLoginType('customer');
      setError('');
      setSuccess('');
      setLoading(false);
      setFormData({ email: '', password: '', name: '', phone: '', address: '', ownerName: '', businessName: '', businessAddress: '', gstNumber: '' });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await handleLogin();
      } else {
        await handleSignup();
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    let endpoint = '';
    
    if (loginType === 'customer') {
      endpoint = `${API_BASE_URL}/customers/login`;
    } else if (loginType === 'seller') {
      endpoint = `${API_BASE_URL}/sellers/login`;
    } else if (loginType === 'admin') {
      endpoint = `${API_BASE_URL}/admin/login`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store token and user data
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', loginType);
      
      const userData = data.customer || data.seller || data.admin;
      localStorage.setItem('userData', JSON.stringify(userData));

      // Call onLoginSuccess with username and role
      const username = userData.name || userData.businessName || userData.ownerName;
      if (onLoginSuccess) {
        onLoginSuccess(username, loginType);
      }

      // Show success message briefly before closing
      setSuccess(`Welcome back, ${username}! Logged in as ${loginType}.`);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleSignup = async () => {
    let endpoint = '';
    let payload = {};

    if (loginType === 'customer') {
      endpoint = `${API_BASE_URL}/customers/signup`;
      payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address
      };
    } else if (loginType === 'seller') {
      endpoint = `${API_BASE_URL}/sellers/signup`;
      payload = {
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        businessAddress: formData.businessAddress,
        gstNumber: formData.gstNumber
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    if (loginType === 'seller') {
      setSuccess('Seller registration submitted! Please wait for admin approval.');
      setTimeout(() => {
        setMode('login');
        setSuccess('');
      }, 3000);
    } else {
      // Customer signup - automatically logged in with token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRole', 'customer');
        localStorage.setItem('userData', JSON.stringify(data.customer));

        if (onLoginSuccess) {
          onLoginSuccess(data.customer.name, 'customer');
        }

        setSuccess(`Welcome, ${data.customer.name}! Your account has been created.`);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    }

    setFormData({ email: '', password: '', name: '', phone: '', address: '', ownerName: '', businessName: '', businessAddress: '', gstNumber: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${loginType === 'customer' ? 'active' : ''}`}
            onClick={() => setLoginType('customer')}
          >
            👤 Customer
          </button>
          <button
            className={`tab-btn ${loginType === 'seller' ? 'active' : ''}`}
            onClick={() => setLoginType('seller')}
          >
            🏪 Seller
          </button>
          {mode === 'login' && (
            <button
              className={`tab-btn ${loginType === 'admin' ? 'active' : ''}`}
              onClick={() => setLoginType('admin')}
            >
              🛡️ Admin
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: '12px', marginBottom: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '6px', fontSize: '14px', fontWeight: '500', border: '1px solid #ef9a9a' }}>
              ❌ {error}
            </div>
          )}
          {success && (
            <div style={{ padding: '12px', marginBottom: '15px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', fontSize: '14px', fontWeight: '500', border: '1px solid #81c784' }}>
              ✅ {success}
            </div>
          )}

          {mode === 'signup' && (
            <>
              {loginType === 'seller' ? (
                <>
                  <div className="form-group">
                    <label>Business Name</label>
                    <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required placeholder="Enter business name" />
                  </div>
                  <div className="form-group">
                    <label>Owner Name</label>
                    <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required placeholder="Enter owner name" />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your name" />
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" />
          </div>

          {mode === 'signup' && (
            <>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Enter phone number" />
              </div>
              {loginType === 'customer' && (
                <div className="form-group">
                  <label>Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Enter your address" rows="2" />
                </div>
              )}
            </>
          )}

          {mode === 'signup' && loginType === 'seller' && (
            <>
              <div className="form-group">
                <label>Business Address</label>
                <textarea name="businessAddress" value={formData.businessAddress} onChange={handleChange} required placeholder="Enter business address" rows="2" />
              </div>
              <div className="form-group">
                <label>GST Number</label>
                <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="Enter GST number (optional)" />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter your password" minLength="6" />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '⏳ Please wait...' : (mode === 'login' ? 'Login' : (loginType === 'seller' ? 'Submit for Approval' : 'Create Account'))}
          </button>

          <div className="modal-footer">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button type="button" className="link-btn" onClick={() => setMode('signup')}>
                  Sign up here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button type="button" className="link-btn" onClick={() => setMode('login')}>
                  Login here
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
