import React, { useState } from 'react';
import '../styles/ProductForm.css';

/**
 * ProductForm Component
 * Reusable form for adding/editing products
 */
const ProductForm = ({ 
  formData, 
  editingProduct, 
  categories, 
  onFormChange, 
  onSubmit, 
  onClose 
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 6) {
      setUploadError('Maximum 6 images allowed');
      return;
    }

    setSelectedFiles(files);
    setUploadError('');

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) return;

    setUploadingImages(true);
    setUploadError('');

    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('http://localhost:5050/api/products/upload-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Cloudinary returns full URLs, use them directly
        const cloudinaryUrls = data.imageUrls;
        const currentImages = formData.images ? formData.images.split(', ').filter(img => img) : [];
        onFormChange('images', [...currentImages, ...cloudinaryUrls].join(', '));
        
        // Clear selection
        setSelectedFiles([]);
        setPreviewUrls([]);
      } else {
        setUploadError(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (indexToRemove) => {
    const currentImages = formData.images ? formData.images.split(', ').filter(img => img) : [];
    const updatedImages = currentImages.filter((_, index) => index !== indexToRemove);
    onFormChange('images', updatedImages.join(', '));
  };
  return (
    <div className="product-form-container">
      <form onSubmit={onSubmit} className="product-form">
        <h3>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
        
        <div className="form-group">
          <label>Product Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onFormChange('name', e.target.value)}
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select
              value={formData.category}
              onChange={(e) => onFormChange('category', e.target.value)}
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Image/Emoji *</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => onFormChange('image', e.target.value)}
              placeholder="🎧"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price (₹) *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => onFormChange('price', e.target.value)}
              placeholder="2999"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Discount (%)</label>
            <input
              type="number"
              value={formData.discount}
              onChange={(e) => onFormChange('discount', e.target.value)}
              placeholder="10"
              min="0"
              max="100"
            />
          </div>

          <div className="form-group">
            <label>Stock *</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => onFormChange('stock', e.target.value)}
              placeholder="50"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => onFormChange('description', e.target.value)}
            placeholder="Enter product description"
            rows="3"
            required
          />
        </div>

        <div className="form-group">
          <label>Product Images</label>
          
          {/* File Upload Section */}
          <div className="image-upload-section">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              id="image-upload"
              className="file-input"
            />
            <label htmlFor="image-upload" className="file-label">
              📁 Choose Images (Max 6)
            </label>
            
            {selectedFiles.length > 0 && (
              <button 
                type="button" 
                onClick={handleUploadImages} 
                disabled={uploadingImages}
                className="upload-btn"
              >
                {uploadingImages ? '⏳ Uploading...' : `📤 Upload ${selectedFiles.length} Image(s)`}
              </button>
            )}
          </div>

          {/* Preview Selected Images */}
          {previewUrls.length > 0 && (
            <div className="image-preview-section">
              <p className="preview-label">Selected Images:</p>
              <div className="preview-grid">
                {previewUrls.map((url, index) => (
                  <div key={index} className="preview-item">
                    <img src={url} alt={`Preview ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show Uploaded Images */}
          {formData.images && formData.images.split(', ').filter(img => img).length > 0 && (
            <div className="uploaded-images-section">
              <p className="preview-label">Uploaded Images:</p>
              <div className="uploaded-grid">
                {formData.images.split(', ').filter(img => img).map((url, index) => (
                  <div key={index} className="uploaded-item">
                    <img src={url} alt={`Product ${index + 1}`} />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)}
                      className="remove-img-btn"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadError && <p className="upload-error">{uploadError}</p>}
          <small>Upload up to 5 images (JPG, PNG, GIF, WebP - Max 5MB each)</small>
        </div>

        <div className="form-group">
          <label>Key Features</label>
          <textarea
            value={formData.keyFeatures}
            onChange={(e) => onFormChange('keyFeatures', e.target.value)}
            placeholder="Enter key features (one per line)"
            rows="4"
          />
          <small>Enter each feature on a new line</small>
        </div>

        <div className="form-group">
          <label>Specifications (Optional)</label>
          <textarea
            value={formData.specifications}
            onChange={(e) => onFormChange('specifications', e.target.value)}
            placeholder="Brand: Samsung&#10;Warranty: 1 Year&#10;Color: Black"
            rows="4"
          />
          <small>Format: Key: Value (one per line)</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {editingProduct ? 'Update Product' : 'Add Product'}
          </button>
          <button type="button" onClick={onClose} className="btn-cancel">
            Cancel
          </button>
        </div>

        {editingProduct && (
          <p className="reapproval-note">
            ⚠️ Editing will require admin re-approval
          </p>
        )}
      </form>
    </div>
  );
};

export default ProductForm;
