import React from 'react';

/**
 * InventoryTab Component
 * Shows inventory summary and detailed stock information
 * Props:
 * - myProducts: array of seller's products
 */
function InventoryTab({ myProducts }) {
  // Calculate inventory metrics
  const totalStockValue = myProducts.reduce(
    (sum, p) => sum + (p.price * p.stock), 
    0
  );
  const totalUnits = myProducts.reduce((sum, p) => sum + p.stock, 0);
  const lowStockItems = myProducts.filter(p => p.stock < 20).length;

  // Get stock status
  const getStockStatus = (stock) => {
    if (stock < 20) return { label: 'Low Stock', class: 'low' };
    if (stock < 50) return { label: 'Medium', class: 'medium' };
    return { label: 'Good', class: 'good' };
  };

  return (
    <div className="inventory-tab">
      <h2>📊 Inventory Management</h2>

      {/* Inventory Summary Cards */}
      <div className="inventory-summary">
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-label">Total Stock Value</div>
            <div className="card-value">₹{(totalStockValue / 100000).toFixed(2)}L</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <div className="card-label">Total Units</div>
            <div className="card-value">{totalUnits}</div>
          </div>
        </div>
        <div className="summary-card alert">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <div className="card-label">Low Stock Items</div>
            <div className="card-value">{lowStockItems}</div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Sold</th>
              <th>Stock Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {myProducts.map(product => {
              const stockStatus = getStockStatus(product.stock);
              const stockValue = product.price * product.stock;
              
              return (
                <tr key={product.id}>
                  <td>
                    <div className="product-cell">
                      <span className="product-icon">{product.image}</span>
                      <span className="product-name">{product.name}</span>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>₹{product.price.toLocaleString()}</td>
                  <td>
                    <span className={`stock-count ${stockStatus.class}`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td>{product.sold} units</td>
                  <td>₹{(stockValue / 1000).toFixed(1)}K</td>
                  <td>
                    <span className={`stock-status ${stockStatus.class}`}>
                      {stockStatus.label === 'Low Stock' && '⚠️ Low Stock'}
                      {stockStatus.label === 'Medium' && '🔔 Medium'}
                      {stockStatus.label === 'Good' && '✅ Good'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryTab;
