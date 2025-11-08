import React from 'react';

/**
 * AccountsTab Component
 * Manages customer and seller accounts with actions like suspend, activate, delete
 * Props:
 * - customers: array of customer accounts
 * - sellers: array of seller accounts
 * - accountFilter: current filter (all/active/suspended)
 * - onFilterChange: function to change filter
 * - onSuspendAccount: function to suspend an account
 * - onActivateAccount: function to activate an account
 * - onDeleteAccount: function to delete an account
 */
function AccountsTab({ 
  customers, 
  sellers, 
  accountFilter, 
  onFilterChange,
  onSuspendAccount,
  onActivateAccount,
  onDeleteAccount
}) {
  return (
    <div className="accounts-section">
      <h2>Account Management</h2>

      {/* Filter Buttons */}
      <div className="account-filters">
        <button 
          className={`filter-btn ${accountFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          All Accounts
        </button>
        <button 
          className={`filter-btn ${accountFilter === 'active' ? 'active' : ''}`}
          onClick={() => onFilterChange('active')}
        >
          Active
        </button>
        <button 
          className={`filter-btn ${accountFilter === 'suspended' ? 'active' : ''}`}
          onClick={() => onFilterChange('suspended')}
        >
          Suspended
        </button>
      </div>

      {/* Customer Accounts Section */}
      <div className="account-subsection">
        <h3>👤 Customer Accounts ({customers.length})</h3>
        <div className="accounts-table-container">
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td><strong>{customer.name}</strong></td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.joinedDate}</td>
                  <td>{customer.totalOrders}</td>
                  <td>₹{customer.totalSpent.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${customer.status}`}>
                      {customer.status === 'active' ? '✅ Active' : '⚠️ Suspended'}
                    </span>
                    {customer.suspendedReason && (
                      <div className="suspension-reason">{customer.suspendedReason}</div>
                    )}
                  </td>
                  <td>
                    <div className="account-actions">
                      {customer.status === 'active' ? (
                        <button 
                          className="action-btn suspend"
                          onClick={() => onSuspendAccount(customer.id, 'customer')}
                          title="Suspend account"
                        >
                          🚫
                        </button>
                      ) : (
                        <button 
                          className="action-btn activate"
                          onClick={() => onActivateAccount(customer.id, 'customer')}
                          title="Activate account"
                        >
                          ✅
                        </button>
                      )}
                      <button 
                        className="action-btn delete"
                        onClick={() => onDeleteAccount(customer.id, 'customer')}
                        title="Delete account"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seller Accounts Section */}
      <div className="account-subsection">
        <h3>🏪 Seller Accounts ({sellers.length})</h3>
        <div className="accounts-table-container">
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Owner</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Products</th>
                <th>Total Sales</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map(seller => (
                <tr key={seller.id}>
                  <td><strong>{seller.businessName}</strong></td>
                  <td>{seller.ownerName}</td>
                  <td>{seller.email}</td>
                  <td>{seller.joinedDate}</td>
                  <td>{seller.totalProducts}</td>
                  <td>₹{(seller.totalSales / 1000).toFixed(1)}K</td>
                  <td>
                    <span className="rating">⭐ {seller.rating}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${seller.status}`}>
                      {seller.status === 'active' ? '✅ Active' : '⚠️ Suspended'}
                    </span>
                    {seller.suspendedReason && (
                      <div className="suspension-reason">{seller.suspendedReason}</div>
                    )}
                  </td>
                  <td>
                    <div className="account-actions">
                      {seller.status === 'active' ? (
                        <button 
                          className="action-btn suspend"
                          onClick={() => onSuspendAccount(seller.id, 'seller')}
                          title="Suspend account"
                        >
                          🚫
                        </button>
                      ) : (
                        <button 
                          className="action-btn activate"
                          onClick={() => onActivateAccount(seller.id, 'seller')}
                          title="Activate account"
                        >
                          ✅
                        </button>
                      )}
                      <button 
                        className="action-btn delete"
                        onClick={() => onDeleteAccount(seller.id, 'seller')}
                        title="Delete account"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AccountsTab;
