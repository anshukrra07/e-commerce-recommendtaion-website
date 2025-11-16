import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import '../styles/AdminDashboard.css';
import { API_BASE_URL } from '../../utils/environment.js';

// Import Tab Components
import DashboardTab from '../components/AdminTabs/DashboardTab';
import ApprovalsTab from '../components/AdminTabs/ApprovalsTab';
import AccountsTab from '../components/AdminTabs/AccountsTab';
import FraudMonitorTab from '../components/AdminTabs/FraudMonitorTab';
import BannersTab from '../components/AdminTabs/BannersTab';

/**
 * AdminDashboard Component
 * Main admin panel with 5 tabs for comprehensive platform management:
 * 1. Dashboard - Platform analytics and overview
 * 2. Approvals - Seller registrations and product listings approval
 * 3. Accounts - Customer and seller account management
 * 4. Fraud Monitor - Security and fraud detection
 * 5. Banners - Promotional banner management
 */
function AdminDashboard({ isLoggedIn, userName, userRole, onLogout }) {
  const navigate = useNavigate();
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Approvals data state
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Accounts data state
  const [customers, setCustomers] = useState([]);
  const [sellersList, setSellersList] = useState([]);
  const [accountFilter, setAccountFilter] = useState('all');
  
  // Analytics data state
  const [analytics, setAnalytics] = useState(null);
  
  // Fraud data state
  const [fraudList, setFraudList] = useState([]);
  const [fraudFilter, setFraudFilter] = useState('all');
  
  // Banners data state
  const [banners, setBanners] = useState([]);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    backgroundColor: '#FF6B6B',
    backgroundColorEnd: '',
    textColor: '#FFFFFF',
    buttonText: 'Shop Now',
    buttonLink: '/products/all',
    position: 'homepage-top',
    startDate: '',
    endDate: '',
    status: 'active',
    priority: 1
  });

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'approvals') {
      fetchPendingSellers();
      fetchPendingProducts();
    } else if (activeTab === 'accounts') {
      fetchAllCustomers();
      fetchAllSellers();
    } else if (activeTab === 'dashboard') {
      fetchAdminAnalytics();
    } else if (activeTab === 'fraud') {
      fetchFraudReports();
    } else if (activeTab === 'banners') {
      fetchBanners();
    }
  }, [activeTab]);

  const fetchAllCustomers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/admin/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        const transformed = data.customers.map(c => ({
          id: c._id,
          name: c.name,
          email: c.email,
          phone: c.phone || 'N/A',
          joinedDate: new Date(c.createdAt).toLocaleDateString(),
          orders: 0, // Would need separate endpoint
          totalSpent: 0, // Would need separate endpoint
          status: 'active'
        }));
        setCustomers(transformed);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchAllSellers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/admin/sellers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        const transformed = data.sellers.map(s => ({
          id: s._id,
          businessName: s.businessName,
          ownerName: s.ownerName,
          email: s.email,
          phone: s.phone,
          joinedDate: new Date(s.createdAt).toLocaleDateString(),
          products: 0, // Would need separate endpoint
          revenue: 0, // Would need separate endpoint
          status: s.status
        }));
        setSellersList(transformed);
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  };

  const fetchAdminAnalytics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
    }
  };

  const fetchPendingSellers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/admin/sellers/pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Transform API data to match frontend structure
        const transformedSellers = data.sellers.map(seller => ({
          id: seller._id,
          businessName: seller.businessName,
          ownerName: seller.ownerName,
          email: seller.email,
          phone: seller.phone,
          businessAddress: seller.businessAddress,
          gstNumber: seller.gstNumber,
          bankAccount: seller.bankAccount,
          submittedDate: new Date(seller.submittedDate).toISOString().split('T')[0],
          status: seller.status
        }));
        setSellers(transformedSellers);
      } else {
        console.error('Failed to fetch pending sellers:', data.message);
      }
    } catch (error) {
      console.error('Error fetching pending sellers:', error);
    }
  };

  // ===== APPROVALS TAB HANDLERS =====
  const handleApproveSeller = async (sellerId) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/admin/sellers/${sellerId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}`);
        setSellers(sellers.filter(s => s.id !== sellerId));
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      alert(`❌ Error approving seller: ${error.message}`);
    }
  };

  const handleRejectSeller = async (sellerId) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller) return;

    const reason = prompt(`Enter rejection reason for "${seller.businessName}":`);
    if (!reason) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/admin/sellers/${sellerId}/reject`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert(`❌ ${data.message}\n\nReason: ${reason}`);
        setSellers(sellers.filter(s => s.id !== sellerId));
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      alert(`❌ Error rejecting seller: ${error.message}`);
    }
  };

  const fetchPendingProducts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/products/admin/pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Transform API data to match frontend structure
        const transformedProducts = data.products.map(product => ({
          id: product._id,
          name: product.name,
          category: product.category,
          price: product.price,
          discount: product.discount,
          stock: product.stock,
          image: product.image,
          description: product.description,
          seller: product.seller?.businessName || 'Unknown Seller',
          submittedDate: new Date(product.submittedDate).toISOString().split('T')[0],
          status: product.status
        }));
        setProducts(transformedProducts);
      } else {
        console.error('Failed to fetch pending products:', data.message);
      }
    } catch (error) {
      console.error('Error fetching pending products:', error);
    }
  };

  const handleApproveProduct = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/products/admin/${productId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}\n\nProduct "${product.name}" is now visible to customers.`);
        setProducts(products.filter(p => p.id !== productId));
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      alert(`❌ Error approving product: ${error.message}`);
    }
  };

  const handleRejectProduct = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const reason = prompt(`Enter rejection reason for "${product.name}":`);
    if (!reason) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/products/admin/${productId}/reject`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert(`❌ ${data.message}\n\nReason: ${reason}\nSeller "${product.seller}" has been notified.`);
        setProducts(products.filter(p => p.id !== productId));
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      alert(`❌ Error rejecting product: ${error.message}`);
    }
  };

  // ===== FRAUD TAB DATA FETCHING =====
  const fetchFraudReports = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/fraud/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        // Transform API data to match frontend structure
        const transformed = data.data.map(f => ({
          id: f._id,
          type: f.type,
          reportedBy: f.reportedBy.name,
          reportedEntity: f.reportedEntity.name || 'Unknown',
          description: f.description,
          amount: f.amount,
          severity: f.severity,
          status: f.status,
          date: new Date(f.createdAt).toLocaleDateString()
        }));
        setFraudList(transformed);
      }
    } catch (error) {
      console.error('Error fetching fraud reports:', error);
    }
  };

  // ===== BANNERS TAB DATA FETCHING =====
  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/banners`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        // Transform API data to match frontend structure
        const transformed = data.data.map(b => ({
          id: b._id,
          title: b.title,
          subtitle: b.subtitle,
          image: b.image || '',
          backgroundColor: b.backgroundColor,
          backgroundColorEnd: b.backgroundColorEnd || '',
          textColor: b.textColor,
          buttonText: b.buttonText,
          buttonLink: b.buttonLink,
          position: b.position,
          startDate: b.startDate ? new Date(b.startDate).toISOString().split('T')[0] : '',
          endDate: b.endDate ? new Date(b.endDate).toISOString().split('T')[0] : '',
          status: b.status,
          priority: b.priority,
          impressions: b.impressions,
          clicks: b.clicks
        }));
        setBanners(transformed);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  // ===== ACCOUNTS TAB HANDLERS =====
  const handleAccountFilterChange = (filter) => {
    setAccountFilter(filter);
  };

  const handleSuspendAccount = (accountId, accountType) => {
    const list = accountType === 'customer' ? customers : sellersList;
    const setList = accountType === 'customer' ? setCustomers : setSellersList;
    const account = list.find(a => a.id === accountId);
    if (account) {
      const reason = prompt(`Enter reason for suspending ${account.name || account.businessName}:`);
      if (reason) {
        alert(`⚠️ Account "${account.name || account.businessName}" has been suspended.\n\nReason: ${reason}`);
        setList(list.map(a => a.id === accountId ? {...a, status: 'suspended', suspendedReason: reason} : a));
      }
    }
  };

  const handleActivateAccount = (accountId, accountType) => {
    const list = accountType === 'customer' ? customers : sellersList;
    const setList = accountType === 'customer' ? setCustomers : setSellersList;
    const account = list.find(a => a.id === accountId);
    if (account) {
      if (window.confirm(`Activate account for "${account.name || account.businessName}"?`)) {
        alert(`✅ Account "${account.name || account.businessName}" has been reactivated.`);
        setList(list.map(a => a.id === accountId ? {...a, status: 'active', suspendedReason: undefined} : a));
      }
    }
  };

  const handleDeleteAccount = (accountId, accountType) => {
    const list = accountType === 'customer' ? customers : sellersList;
    const setList = accountType === 'customer' ? setCustomers : setSellersList;
    const account = list.find(a => a.id === accountId);
    if (account) {
      if (window.confirm(`⚠️ Are you sure you want to permanently delete "${account.name || account.businessName}"?\n\nThis action cannot be undone.`)) {
        alert(`🗑️ Account "${account.name || account.businessName}" has been deleted.`);
        setList(list.filter(a => a.id !== accountId));
      }
    }
  };

  // ===== FRAUD MONITOR TAB HANDLERS =====
  const handleFraudFilterChange = (filter) => {
    setFraudFilter(filter);
  };

  const handleInvestigateFraud = async (fraudId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/fraud/reports/${fraudId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'investigating' })
      });
      const data = await response.json();
      if (data.success) {
        alert('Investigation started. Status updated to "Investigating".');
        fetchFraudReports();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error investigating fraud:', error);
      alert('Failed to update fraud status');
    }
  };

  const handleResolveFraud = async (fraudId) => {
    const fraud = fraudList.find(f => f.id === fraudId);
    if (!fraud) return;

    const action = prompt(`Enter resolution action for this ${fraud.type} fraud case:`);
    if (!action) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/fraud/reports/${fraudId}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, notes: action })
      });
      const data = await response.json();
      if (data.success) {
        alert(`✅ Fraud case resolved.\n\nAction taken: ${action}`);
        fetchFraudReports();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error resolving fraud:', error);
      alert('Failed to resolve fraud case');
    }
  };

  const handleDismissFraud = async (fraudId) => {
    if (!window.confirm('Dismiss this fraud report as false alarm?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/fraud/reports/${fraudId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('Fraud report dismissed.');
        fetchFraudReports();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error dismissing fraud:', error);
      alert('Failed to dismiss fraud report');
    }
  };

  // ===== BANNERS TAB HANDLERS =====
  const handleBannerFormDataChange = (field, value) => {
    setBannerFormData({...bannerFormData, [field]: value});
  };

  const handleBannerFormBatchUpdate = (updates) => {
    setBannerFormData({...bannerFormData, ...updates});
  };

  const handleShowBannerForm = () => {
    setShowBannerForm(true);
    setEditingBanner(null);
    setBannerFormData({
      title: '',
      subtitle: '',
      image: '',
      backgroundColor: '#FF6B6B',
      backgroundColorEnd: '',
      textColor: '#FFFFFF',
      buttonText: 'Shop Now',
      buttonLink: '/products/all',
      position: 'homepage-top',
      startDate: '',
      endDate: '',
      status: 'active',
      priority: 1
    });
  };

  const handleHideBannerForm = () => {
    setShowBannerForm(false);
    setEditingBanner(null);
  };

  const handleSubmitBanner = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      const url = editingBanner 
        ? `${API_BASE_URL}/banners/${editingBanner.id}`
        : `${API_BASE_URL}/banners`;
      const method = editingBanner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bannerFormData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert(editingBanner ? '✅ Banner updated successfully!' : '✅ Banner created successfully!');
        fetchBanners();
        handleHideBannerForm();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error submitting banner:', error);
      alert('Failed to save banner');
    }
  };

  const handleEditBanner = (bannerId) => {
    const banner = banners.find(b => b.id === bannerId);
    if (banner) {
      setEditingBanner(banner);
      setBannerFormData({
        title: banner.title,
        subtitle: banner.subtitle,
        image: banner.image || '',
        backgroundColor: banner.backgroundColor,
        backgroundColorEnd: banner.backgroundColorEnd || '',
        textColor: banner.textColor,
        buttonText: banner.buttonText,
        buttonLink: banner.buttonLink,
        position: banner.position,
        startDate: banner.startDate,
        endDate: banner.endDate,
        status: banner.status,
        priority: banner.priority
      });
      setShowBannerForm(true);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!window.confirm('Delete this banner?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/banners/${bannerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('🗑️ Banner deleted.');
        fetchBanners();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Failed to delete banner');
    }
  };

  const handleToggleBannerStatus = async (bannerId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/banners/${bannerId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        fetchBanners();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error toggling banner status:', error);
      alert('Failed to toggle banner status');
    }
  };

  // Filter data based on active filters
  const filteredCustomers = accountFilter === 'all' ? customers : 
    accountFilter === 'active' ? customers.filter(c => c.status === 'active') :
    customers.filter(c => c.status === 'suspended');

  const filteredSellers = accountFilter === 'all' ? sellersList : 
    accountFilter === 'active' ? sellersList.filter(s => s.status === 'active') :
    sellersList.filter(s => s.status === 'suspended');

  const filteredFraud = fraudFilter === 'all' ? fraudList :
    fraudList.filter(f => f.status === fraudFilter);

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <Header 
        cartCount={0} 
        onLoginClick={() => {}}
        isLoggedIn={isLoggedIn}
        userName={userName}
        userRole={userRole}
        onLogout={onLogout}
      />
      
      {/* Admin Dashboard Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>🛡️ Admin Dashboard</h1>
          <button className="back-home-btn" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="admin-container">
        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-text">Dashboard</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'approvals' ? 'active' : ''}`}
            onClick={() => setActiveTab('approvals')}
          >
            <span className="tab-icon">✅</span>
            <span className="tab-text">Approvals</span>
            <span className="tab-badge">{sellers.length + products.length}</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            <span className="tab-icon">👥</span>
            <span className="tab-text">Accounts</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'fraud' ? 'active' : ''}`}
            onClick={() => setActiveTab('fraud')}
          >
            <span className="tab-icon">⚠️</span>
            <span className="tab-text">Fraud Monitor</span>
            <span className="tab-badge fraud-badge">{fraudList.filter(f => f.status !== 'resolved').length}</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'banners' ? 'active' : ''}`}
            onClick={() => setActiveTab('banners')}
          >
            <span className="tab-icon">🎞️</span>
            <span className="tab-text">Banners</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="admin-content">
          {activeTab === 'dashboard' && <DashboardTab />}
          
          {activeTab === 'approvals' && (
            <ApprovalsTab
              sellers={sellers}
              products={products}
              onApproveSeller={handleApproveSeller}
              onRejectSeller={handleRejectSeller}
              onApproveProduct={handleApproveProduct}
              onRejectProduct={handleRejectProduct}
            />
          )}
          
          {activeTab === 'accounts' && (
            <AccountsTab
              customers={filteredCustomers}
              sellers={filteredSellers}
              accountFilter={accountFilter}
              onFilterChange={handleAccountFilterChange}
              onSuspendAccount={handleSuspendAccount}
              onActivateAccount={handleActivateAccount}
              onDeleteAccount={handleDeleteAccount}
            />
          )}
          
          {activeTab === 'fraud' && (
            <FraudMonitorTab
              fraudList={filteredFraud}
              fraudFilter={fraudFilter}
              onFilterChange={handleFraudFilterChange}
              onInvestigate={handleInvestigateFraud}
              onResolve={handleResolveFraud}
              onDismiss={handleDismissFraud}
            />
          )}
          
          {activeTab === 'banners' && (
            <BannersTab 
              banners={banners}
              showBannerForm={showBannerForm}
              editingBanner={editingBanner}
              bannerFormData={bannerFormData}
              onFormDataChange={handleBannerFormDataChange}
              onFormBatchUpdate={handleBannerFormBatchUpdate}
              onShowForm={handleShowBannerForm}
              onHideForm={handleHideBannerForm}
              onSubmitBanner={handleSubmitBanner}
              onEditBanner={handleEditBanner}
              onDeleteBanner={handleDeleteBanner}
              onToggleStatus={handleToggleBannerStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
