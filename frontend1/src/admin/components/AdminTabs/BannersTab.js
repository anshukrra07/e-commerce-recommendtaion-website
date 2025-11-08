import React from 'react';

/**
 * BannersTab Component
 * Manages promotional banners and site-wide announcements
 * Props:
 * - banners: array of promotional banners
 * - showBannerForm: boolean to show/hide form
 * - editingBanner: currently editing banner object or null
 * - bannerFormData: form data object
 * - onFormDataChange: function to update form data
 * - onFormBatchUpdate: function to update multiple form fields at once
 * - onShowForm: function to show form
 * - onHideForm: function to hide form
 * - onSubmitBanner: function to submit banner (create/update)
 * - onEditBanner: function to start editing a banner
 * - onDeleteBanner: function to delete a banner
 * - onToggleStatus: function to toggle banner active/inactive status
 */
function BannersTab({ 
  banners, 
  showBannerForm,
  editingBanner,
  bannerFormData,
  onFormDataChange,
  onFormBatchUpdate,
  onShowForm,
  onHideForm,
  onSubmitBanner,
  onEditBanner,
  onDeleteBanner,
  onToggleStatus
}) {
  // Color Presets
  const colorPresets = [
    {
      name: '🌅 Sunset Vibes',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      bg1: '#f093fb',
      bg2: '#f5576c',
      textColor: '#ffffff'
    },
    {
      name: '🌊 Ocean Blue',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      bg1: '#4facfe',
      bg2: '#00f2fe',
      textColor: '#ffffff'
    },
    {
      name: '🍃 Fresh Mint',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      bg1: '#43e97b',
      bg2: '#38f9d7',
      textColor: '#1a202c'
    },
    {
      name: '🔥 Fire Red',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      bg1: '#fa709a',
      bg2: '#fee140',
      textColor: '#ffffff'
    },
    {
      name: '🌌 Purple Dream',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      bg1: '#667eea',
      bg2: '#764ba2',
      textColor: '#ffffff'
    },
    {
      name: '🌟 Golden Hour',
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      bg1: '#ffecd2',
      bg2: '#fcb69f',
      textColor: '#2d3748'
    },
    {
      name: '🌑 Dark Night',
      gradient: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
      bg1: '#2c3e50',
      bg2: '#000000',
      textColor: '#ffffff'
    },
    {
      name: '🍒 Berry Blast',
      gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
      bg1: '#ee0979',
      bg2: '#ff6a00',
      textColor: '#ffffff'
    }
  ];

  // Helper function to apply preset
  const applyPreset = (preset) => {
    // Update all three colors at once using batch update
    onFormBatchUpdate({
      backgroundColor: preset.bg1,
      backgroundColorEnd: preset.bg2,
      textColor: preset.textColor
    });
  };

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { icon: '✅', text: 'Active', class: 'status-active' },
      inactive: { icon: '⏸️', text: 'Inactive', class: 'status-inactive' },
      scheduled: { icon: '📅', text: 'Scheduled', class: 'status-scheduled' },
      expired: { icon: '⏰', text: 'Expired', class: 'status-expired' }
    };
    return statusMap[status] || statusMap.inactive;
  };

  return (
    <div className="banners-section">
      <div className="banners-header">
        <h2>🎞️ Promotional Banners</h2>
        <button 
          className="create-banner-btn"
          onClick={onShowForm}
        >
          ➕ Create New Banner
        </button>
      </div>

      {/* Banner Creation/Edit Form */}
      {showBannerForm && (
        <div className="banner-form-overlay">
          <div className="banner-form-modal">
            <div className="form-modal-header">
              <h3>{editingBanner ? 'Edit Banner' : 'Create New Banner'}</h3>
              <button className="close-btn" onClick={onHideForm}>✕</button>
            </div>
            
            <div className="banner-form-container">
              {/* Live Preview Card */}
              <div className="banner-live-preview">
                <h4>🎨 Live Preview</h4>
                <div className="preview-description">
                  This is how your banner will look on the homepage
                </div>
                <div 
                  className="live-preview-banner"
                  style={{
                    backgroundImage: bannerFormData.image 
                      ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${bannerFormData.image})`
                      : bannerFormData.backgroundColorEnd
                        ? `linear-gradient(135deg, ${bannerFormData.backgroundColor} 0%, ${bannerFormData.backgroundColorEnd} 100%)`
                        : `linear-gradient(135deg, ${bannerFormData.backgroundColor} 0%, ${bannerFormData.backgroundColor}dd 100%)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: bannerFormData.textColor,
                    padding: '3rem 2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    minHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Animated background effect */}
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    animation: 'pulse 4s ease-in-out infinite',
                    pointerEvents: 'none'
                  }} />
                  
                  {/* Badge/Tag */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}>
                    🔥 HOT DEAL
                  </div>

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ 
                      fontSize: '2.8rem', 
                      marginBottom: '1rem',
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                      letterSpacing: '-1px'
                    }}>
                      {bannerFormData.title || 'Your Banner Title'}
                    </h2>
                    <p style={{ 
                      fontSize: '1.3rem', 
                      marginBottom: '2rem',
                      opacity: 0.95,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                    }}>
                      {bannerFormData.subtitle || 'Your banner subtitle will appear here'}
                    </p>
                    <button 
                      type="button"
                      style={{
                        background: `linear-gradient(135deg, ${bannerFormData.textColor} 0%, ${bannerFormData.textColor}dd 100%)`,
                        color: bannerFormData.backgroundColor,
                        border: 'none',
                        padding: '14px 36px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05) translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1) translateY(0)'}
                    >
                      {bannerFormData.buttonText || 'Button Text'} →
                    </button>
                  </div>
                </div>
                <div className="preview-info">
                  <small>
                    📍 Position: <strong>{bannerFormData.position}</strong> | 
                    ⚡ Priority: <strong>{bannerFormData.priority}</strong>
                  </small>
                </div>
              </div>

              <form className="banner-form" onSubmit={onSubmitBanner}>
              {/* Title Input */}
              <div className="form-group">
                <label>Banner Title *</label>
                <input
                  type="text"
                  value={bannerFormData.title}
                  onChange={(e) => onFormDataChange('title', e.target.value)}
                  placeholder="e.g. Summer Sale 2024"
                  required
                />
              </div>

              {/* Subtitle Input */}
              <div className="form-group">
                <label>Subtitle *</label>
                <input
                  type="text"
                  value={bannerFormData.subtitle}
                  onChange={(e) => onFormDataChange('subtitle', e.target.value)}
                  placeholder="e.g. Up to 70% OFF on Fashion"
                  required
                />
              </div>

              {/* Image URL Input */}
              <div className="form-group">
                <label>Background Image URL (Optional)</label>
                <input
                  type="text"
                  value={bannerFormData.image || ''}
                  onChange={(e) => onFormDataChange('image', e.target.value)}
                  placeholder="e.g. https://example.com/banner.jpg or leave empty for solid color"
                />
                <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                  💡 Tip: Use high-quality images (1920x600px recommended). Image will have a dark overlay for text visibility.
                </small>
              </div>

              {/* Color Presets */}
              <div className="form-group">
                <label>🎨 Color Presets (Click to apply)</label>
                <div className="color-presets-grid">
                  {colorPresets.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      className="preset-card"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        applyPreset(preset);
                      }}
                      style={{
                        backgroundImage: preset.gradient,
                        cursor: 'pointer',
                        padding: '1rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: preset.textColor,
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: '2px solid transparent',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Inputs */}
              <div className="form-row">
                <div className="form-group">
                  <label>Background Color (Start)</label>
                  <input
                    type="color"
                    value={bannerFormData.backgroundColor}
                    onChange={(e) => onFormDataChange('backgroundColor', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Background Color (End)</label>
                  <input
                    type="color"
                    value={bannerFormData.backgroundColorEnd || bannerFormData.backgroundColor}
                    onChange={(e) => onFormDataChange('backgroundColorEnd', e.target.value)}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                    Creates gradient from start to end color
                  </small>
                </div>
              </div>
              
              <div className="form-group">
                <label>Text Color</label>
                <input
                  type="color"
                  value={bannerFormData.textColor}
                  onChange={(e) => onFormDataChange('textColor', e.target.value)}
                  style={{ width: '100%', height: '45px' }}
                />
              </div>

              {/* Button Configuration */}
              <div className="form-row">
                <div className="form-group">
                  <label>Button Text</label>
                  <input
                    type="text"
                    value={bannerFormData.buttonText}
                    onChange={(e) => onFormDataChange('buttonText', e.target.value)}
                    placeholder="e.g. Shop Now"
                  />
                </div>
                <div className="form-group">
                  <label>Button Link</label>
                  <input
                    type="text"
                    value={bannerFormData.buttonLink}
                    onChange={(e) => onFormDataChange('buttonLink', e.target.value)}
                    placeholder="e.g. /products/fashion"
                  />
                </div>
              </div>

              {/* Position and Status */}
              <div className="form-row">
                <div className="form-group">
                  <label>Position</label>
                  <select
                    value={bannerFormData.position}
                    onChange={(e) => onFormDataChange('position', e.target.value)}
                  >
                    <option value="homepage-top">Homepage - Top</option>
                    <option value="homepage-middle">Homepage - Middle</option>
                    <option value="seller-dashboard">Seller Dashboard</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={bannerFormData.priority}
                    onChange={(e) => onFormDataChange('priority', parseInt(e.target.value))}
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="text"
                    value={bannerFormData.startDate}
                    onChange={(e) => onFormDataChange('startDate', e.target.value)}
                    placeholder="e.g. 01 May 2024"
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="text"
                    value={bannerFormData.endDate}
                    onChange={(e) => onFormDataChange('endDate', e.target.value)}
                    placeholder="e.g. 31 May 2024"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={onHideForm}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Banners List */}
      <div className="banners-list">
        {banners.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎞️</div>
            <h3>No Banners</h3>
            <p>Create your first promotional banner to get started.</p>
          </div>
        ) : (
          <div className="banners-grid">
            {banners.map(banner => {
              const statusInfo = getStatusBadge(banner.status);
              return (
                <div key={banner.id} className="banner-card">
                  {/* Banner Preview */}
                  <div 
                    className="banner-preview-small"
                    style={{
                      backgroundColor: banner.backgroundColor,
                      color: banner.textColor
                    }}
                  >
                    <h4>{banner.title}</h4>
                    <p>{banner.subtitle}</p>
                  </div>

                  {/* Banner Info */}
                  <div className="banner-info">
                    <div className="banner-meta">
                      <span className={`status-badge ${statusInfo.class}`}>
                        {statusInfo.icon} {statusInfo.text}
                      </span>
                      <span className="banner-position">📍 {banner.position}</span>
                    </div>
                    
                    <div className="banner-dates">
                      <div>📅 {banner.startDate} - {banner.endDate}</div>
                    </div>

                    <div className="banner-stats">
                      <span>👁️ {banner.impressions.toLocaleString()} views</span>
                      <span>🖱️ {banner.clicks.toLocaleString()} clicks</span>
                      {banner.clicks > 0 && (
                        <span>📊 {((banner.clicks / banner.impressions) * 100).toFixed(2)}% CTR</span>
                      )}
                    </div>
                  </div>

                  {/* Banner Actions */}
                  <div className="banner-actions">
                    <button 
                      className="banner-action-btn edit"
                      onClick={() => onEditBanner(banner.id)}
                      title="Edit banner"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="banner-action-btn toggle"
                      onClick={() => onToggleStatus(banner.id)}
                      title={banner.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {banner.status === 'active' ? '⏸️ Pause' : '▶️ Activate'}
                    </button>
                    <button 
                      className="banner-action-btn delete"
                      onClick={() => onDeleteBanner(banner.id)}
                      title="Delete banner"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BannersTab;
