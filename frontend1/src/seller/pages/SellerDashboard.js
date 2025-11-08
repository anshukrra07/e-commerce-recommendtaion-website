import React, { useState, useEffect } from 'react';
import Header from '../../shared/components/Header/Header';
import Footer from '../../shared/components/Footer/Footer';
import '../styles/SellerDashboard.css';
import '../styles/OverviewTab.css';
import '../styles/ProductsTab.css';
import '../styles/OrdersTab.css';
import '../styles/AnalyticsTab.css';
import '../styles/InventoryTab.css';
import '../styles/ReviewsTab.css';
import '../styles/ChatsTab.css';
import '../styles/Responsive.css';

// Import Tab Components
import OverviewTab from '../components/SellerTabs/OverviewTab';
import ProductsTab from '../components/SellerTabs/ProductsTab';
import OrdersTab from '../components/SellerTabs/OrdersTab';
import AnalyticsTab from '../components/SellerTabs/AnalyticsTab';
import InventoryTab from '../components/SellerTabs/InventoryTab';
import ReviewsTab from '../components/SellerTabs/ReviewsTab';
import ChatsTab from '../components/SellerTabs/ChatsTab';

/**
 * SellerDashboard Component
 * Main seller dashboard with 6 tabs for managing products, orders, analytics, etc.
 * Uses modular tab components for better organization and maintainability
 */
const SellerDashboard = ({ isLoggedIn, userName, userRole, onLoginSuccess, onLogout }) => {
  // Active tab state
  const [activeTab, setActiveTab] = useState('dashboard');

  // Products State - now from API
  const [myProducts, setMyProducts] = useState([]);
  
  // Analytics State - now from API
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalSold: 0,
    avgOrderValue: 0,
    revenueGrowth: 0,
    ordersThisMonth: 0,
    bestSelling: null,
    monthlyRevenue: []
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Fetch products from API
  useEffect(() => {
    fetchSellerProducts();
    fetchSellerAnalytics();
    fetchSellerOrders();
    fetchSellerReviews();
  }, []);

  const fetchSellerProducts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5050/api/products/seller', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Transform products to match component format
        const transformedProducts = data.products.map(p => ({
          id: p._id,
          name: p.name,
          category: p.category,
          price: p.price,
          discount: p.discount || 0,
          stock: p.stock,
          sold: p.sold || 0,
          image: p.image,
          description: p.description,
          status: p.status,
          revenue: p.revenue || 0
        }));
        setMyProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchSellerAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5050/api/analytics/seller', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        const apiAnalytics = data.analytics;
        setAnalytics({
          totalRevenue: apiAnalytics.totalRevenue,
          totalOrders: apiAnalytics.totalProductsSold,
          totalSold: apiAnalytics.totalProductsSold,
          avgOrderValue: apiAnalytics.averageProductPrice,
          revenueGrowth: 23.5, // Can be calculated if you have historical data
          ordersThisMonth: apiAnalytics.totalProductsSold,
          bestSelling: apiAnalytics.bestSellingProducts[0] || null,
          monthlyRevenue: apiAnalytics.monthlyRevenue || []
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Orders State
  const [orders, setOrders] = useState([]);
  
  const fetchSellerOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5050/api/orders/seller/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching seller orders:', error);
    }
  };

  // Reviews State
  const [reviews, setReviews] = useState({
    products: [],
    seller: []
  });
  
  const fetchSellerReviews = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const sellerId = userData._id || userData.id;
      
      if (!sellerId) {
        console.log('No seller ID found');
        return;
      }
      
      // Fetch seller reviews
      const response = await fetch(`http://localhost:5050/api/reviews/seller/${sellerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      // API returns data.data.reviews, not data.reviews
      if (data.success && data.data && data.data.reviews && Array.isArray(data.data.reviews)) {
        // Transform seller reviews (these are reviews on seller's products)
        const productReviews = data.data.reviews.map(r => ({
          id: r._id,
          productName: r.product?.name || 'Product',
          productIcon: '📦',
          customerName: r.customer?.name || 'Anonymous',
          rating: r.rating,
          comment: r.comment,
          date: new Date(r.createdAt).toLocaleDateString(),
          verified: true,
          helpful: 0
        }));
        
        setReviews({
          products: productReviews,
          seller: [] // Seller reviews (on storefront) would need separate endpoint
        });
      } else {
        // No reviews or empty array
        setReviews({
          products: [],
          seller: []
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Set empty reviews on error
      setReviews({
        products: [],
        seller: []
      });
    }
  };

  // ===== EVENT HANDLERS =====

  const handleOrderAction = async (orderId, action) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const token = localStorage.getItem('authToken');
      let newStatus = '';
      let eventCode = '';
      let eventDescription = '';

      if (action === 'ship') {
        newStatus = 'shipped';
        eventCode = 'SHIPPED';
        eventDescription = 'Order has been shipped';
      } else if (action === 'approve-return') {
        newStatus = 'cancelled';
        eventCode = 'RETURN_APPROVED';
        eventDescription = 'Return request approved';
      }

      // Update order status in backend
      const response = await fetch(`http://localhost:5050/api/orders/${order.orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          eventCode,
          eventDescription
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh orders from backend
        await fetchSellerOrders();
        alert(`Order ${orderId} updated successfully!`);
      } else {
        alert(`Failed to update order: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  return (
    <div className="seller-dashboard-page">
      <Header
        cartCount={0}
        onLoginClick={() => {}}
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={userRole}
        onLogout={onLogout}
      />

      <div className="seller-dashboard">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h1>🏪 Seller Dashboard</h1>
          <p>Welcome back, {userName}!</p>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 Products
          </button>
          <button
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📋 Orders ({orders.length})
          </button>
          <button
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
          <button
            className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            📊 Inventory
          </button>
          <button
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            ⭐ Reviews ({reviews.products.length})
          </button>
          <button
            className={`tab ${activeTab === 'chats' ? 'active' : ''}`}
            onClick={() => setActiveTab('chats')}
          >
            💬 Chats
          </button>
        </div>

        {/* Tab Content */}
        <div className="dashboard-content">
          {activeTab === 'dashboard' && (
            <OverviewTab
              analytics={analytics}
              myProducts={myProducts}
              orders={orders}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              onOrderAction={handleOrderAction}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              myProducts={myProducts}
              analytics={analytics}
              loading={loadingAnalytics}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab
              myProducts={myProducts}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsTab
              reviews={reviews}
            />
          )}

          {activeTab === 'chats' && (
            <ChatsTab />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SellerDashboard;
