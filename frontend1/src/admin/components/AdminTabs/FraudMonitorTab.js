import React from 'react';

/**
 * FraudMonitorTab Component
 * Monitors and manages fraud reports, suspicious activities, and fake listings
 * Props:
 * - fraudList: array of fraud reports
 * - fraudFilter: current filter (all/pending/investigating/resolved)
 * - onFilterChange: function to change filter
 * - onInvestigate: function to start investigation
 * - onResolve: function to resolve fraud case
 * - onDismiss: function to dismiss fraud report
 */
function FraudMonitorTab({ 
  fraudList, 
  fraudFilter, 
  onFilterChange,
  onInvestigate,
  onResolve,
  onDismiss
}) {
  // Helper function to get severity badge color
  const getSeverityClass = (severity) => {
    const severityMap = {
      critical: 'severity-critical',
      high: 'severity-high',
      medium: 'severity-medium',
      low: 'severity-low'
    };
    return severityMap[severity] || 'severity-medium';
  };

  return (
    <div className="fraud-monitor-section">
      <h2>⚠️ Fraud & Security Monitor</h2>

      {/* Filter Buttons */}
      <div className="fraud-filters">
        <button 
          className={`filter-btn ${fraudFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          All Reports ({fraudList.length})
        </button>
        <button 
          className={`filter-btn ${fraudFilter === 'pending' ? 'active' : ''}`}
          onClick={() => onFilterChange('pending')}
        >
          Pending ({fraudList.filter(f => f.status === 'pending').length})
        </button>
        <button 
          className={`filter-btn ${fraudFilter === 'investigating' ? 'active' : ''}`}
          onClick={() => onFilterChange('investigating')}
        >
          Investigating ({fraudList.filter(f => f.status === 'investigating').length})
        </button>
        <button 
          className={`filter-btn ${fraudFilter === 'resolved' ? 'active' : ''}`}
          onClick={() => onFilterChange('resolved')}
        >
          Resolved ({fraudList.filter(f => f.status === 'resolved').length})
        </button>
      </div>

      {/* Fraud Reports List */}
      <div className="fraud-reports-list">
        {fraudList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>No Fraud Reports</h3>
            <p>All clear! No fraud reports match the current filter.</p>
          </div>
        ) : (
          fraudList.map(fraud => (
            <div key={fraud.id} className={`fraud-report-card ${fraud.status}`}>
              {/* Card Header */}
              <div className="fraud-card-header">
                <div className="fraud-type-badge">
                  {fraud.type === 'product' && '📦 Product'}
                  {fraud.type === 'seller' && '🏪 Seller'}
                  {fraud.type === 'account' && '👤 Account'}
                  {fraud.type === 'payment' && '💳 Payment'}
                </div>
                <div className={`severity-badge ${getSeverityClass(fraud.severity)}`}>
                  {fraud.severity.toUpperCase()}
                </div>
                <div className={`status-badge ${fraud.status}`}>
                  {fraud.status === 'pending' && '⏳ Pending'}
                  {fraud.status === 'investigating' && '🔍 Investigating'}
                  {fraud.status === 'resolved' && '✅ Resolved'}
                </div>
              </div>

              {/* Main Information */}
              <div className="fraud-card-body">
                <div className="fraud-main-info">
                  {fraud.productName && (
                    <h3 className="fraud-title">📦 {fraud.productName}</h3>
                  )}
                  {fraud.seller && !fraud.productName && (
                    <h3 className="fraud-title">🏪 {fraud.seller}</h3>
                  )}
                  {fraud.accountName && (
                    <h3 className="fraud-title">👤 {fraud.accountName}</h3>
                  )}
                  
                  <div className="fraud-reason">
                    <strong>Reason:</strong> {fraud.reason}
                  </div>
                  <div className="fraud-description">
                    {fraud.description}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="fraud-details-grid">
                  <div className="fraud-detail">
                    <span className="detail-label">Reported By:</span>
                    <span className="detail-value">{fraud.reportedBy}</span>
                  </div>
                  <div className="fraud-detail">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{fraud.reportedDate}</span>
                  </div>
                  <div className="fraud-detail">
                    <span className="detail-label">Report Count:</span>
                    <span className="detail-value">{fraud.reportCount} reports</span>
                  </div>
                  <div className="fraud-detail">
                    <span className="detail-label">Evidence:</span>
                    <span className="detail-value">{fraud.evidence}</span>
                  </div>
                  {fraud.seller && fraud.productName && (
                    <div className="fraud-detail">
                      <span className="detail-label">Seller:</span>
                      <span className="detail-value">{fraud.seller}</span>
                    </div>
                  )}
                  {fraud.resolvedAction && (
                    <div className="fraud-detail resolved-action">
                      <span className="detail-label">Resolution:</span>
                      <span className="detail-value">{fraud.resolvedAction}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="fraud-card-actions">
                {fraud.status === 'pending' && (
                  <>
                    <button 
                      className="fraud-action-btn investigate"
                      onClick={() => onInvestigate(fraud.id)}
                    >
                      🔍 Investigate
                    </button>
                    <button 
                      className="fraud-action-btn dismiss"
                      onClick={() => onDismiss(fraud.id)}
                    >
                      ❌ Dismiss
                    </button>
                  </>
                )}
                {fraud.status === 'investigating' && (
                  <button 
                    className="fraud-action-btn resolve"
                    onClick={() => onResolve(fraud.id)}
                  >
                    ✅ Resolve
                  </button>
                )}
                {fraud.status === 'resolved' && (
                  <div className="resolved-badge">
                    ✅ Case Resolved
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FraudMonitorTab;
