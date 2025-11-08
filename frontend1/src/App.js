import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './customer/pages/ProductsPage';
import AdminDashboard from './admin/pages/AdminDashboard';
import SellerDashboard from './seller/pages/SellerDashboard';
import SellerStorefront from './seller/pages/SellerStorefront';
import ProductDetailsPage from './customer/pages/ProductDetailsPage';
import CartWishlistPage from './customer/pages/CartWishlistPage';
import ComparisonPage from './customer/pages/ComparisonPage';
import './styles/App.css';
import CheckoutPage from './pages/CheckoutPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrdersPage from './customer/pages/OrdersPage';

function App() {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    userName: 'User',
    userRole: 'customer'
  });

  // Check localStorage on app load to restore login state
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const userData = localStorage.getItem('userData');

    if (token && role && userData) {
      try {
        const user = JSON.parse(userData);
        const userName = user.name || user.businessName || user.ownerName || 'User';
        
        setAuthState({
          isLoggedIn: true,
          userName: userName,
          userRole: role
        });
        
        console.log('✅ Login restored from localStorage:', { userName, role });
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  const handleLoginSuccess = (name, role) => {
    console.log('App.js received - Name:', name, 'Role:', role); // Debug log
    setAuthState({
      isLoggedIn: true,
      userName: name,
      userRole: role
    });
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    
    setAuthState({
      isLoggedIn: false,
      userName: 'User',
      userRole: 'customer'
    });
    
    console.log('✅ User logged out');
  };

  // Debug: Log state changes
  useEffect(() => {
    console.log('App.js STATE CHANGE - isLoggedIn:', authState.isLoggedIn, 'userName:', authState.userName, 'userRole:', authState.userRole);
  }, [authState]);

  const authProps = {
    isLoggedIn: authState.isLoggedIn,
    userName: authState.userName,
    userRole: authState.userRole,
    onLoginSuccess: handleLoginSuccess,
    onLogout: handleLogout
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage {...authProps} />} />
        <Route path="/products/:category" element={<ProductsPage {...authProps} />} />
        <Route path="/admin" element={<AdminDashboard {...authProps} />} />
        <Route path="/seller" element={<SellerDashboard {...authProps} />} />
        <Route path="/shop/:sellerKey" element={<SellerStorefront {...authProps} />} />
        <Route path="/product/:productId" element={<ProductDetailsPage {...authProps} />} />
        <Route path="/cart" element={<CartWishlistPage {...authProps} />} />
        <Route path="/compare" element={<ComparisonPage {...authProps} />} />
        <Route path="/orders" element={<OrdersPage {...authProps} />} />
        <Route path="/checkout" element={<CheckoutPage {...authProps} />} />
        <Route path="/order/:orderId" element={<OrderDetailsPage {...authProps} />} />
      </Routes>
    </Router>
  );
}

export default App;
