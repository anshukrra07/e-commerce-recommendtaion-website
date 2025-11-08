import React, { useState, useEffect } from 'react';
import ProductForm from '../ProductForm';
import ProductList from '../ProductList';
import '../../styles/ProductsTabNew.css';

const API_BASE_URL = 'http://localhost:5050/api';

/**
 * ProductsTab Component
 * Manages seller's products with full CRUD operations via API
 */
const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'electronics',
    price: '',
    discount: 0,
    stock: '',
    image: '',
    description: '',
    images: '',
    keyFeatures: '',
    specifications: ''
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const categories = [
    { value: 'electronics', label: '📱 Electronics' },
    { value: 'clothing', label: '👕 Clothing' },
    { value: 'footwear', label: '👟 Footwear' },
    { value: 'accessories', label: '💍 Accessories' },
    { value: 'home-decor', label: '🏠 Home Decor' }
  ];

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Auto-clear messages after 3 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/products/seller`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'electronics',
      price: '',
      discount: 0,
      stock: '',
      image: '',
      description: '',
      images: '',
      keyFeatures: '',
      specifications: ''
    });
    setError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'electronics',
      price: '',
      discount: 0,
      stock: '',
      image: '',
      description: '',
      images: '',
      keyFeatures: '',
      specifications: ''
    });
    setError(null);
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      discount: product.discount || 0,
      stock: product.stock,
      image: product.image,
      description: product.description,
      images: product.images ? product.images.join(', ') : '',
      keyFeatures: product.keyFeatures ? product.keyFeatures.join('\n') : '',
      specifications: product.specifications ? 
        Object.entries(product.specifications).map(([k, v]) => `${k}: ${v}`).join('\n') : ''
    });
    setShowModal(true);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      const url = editingProduct 
        ? `${API_BASE_URL}/products/seller/${editingProduct._id}`
        : `${API_BASE_URL}/products/seller`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      // Process form data
      const processedData = {
        ...formData,
        images: formData.images ? formData.images.split(',').map(img => img.trim()).filter(img => img) : [],
        keyFeatures: formData.keyFeatures ? formData.keyFeatures.split('\n').map(f => f.trim()).filter(f => f) : [],
        specifications: formData.specifications ? 
          formData.specifications.split('\n').reduce((acc, line) => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
              acc[key.trim()] = valueParts.join(':').trim();
            }
            return acc;
          }, {}) : {}
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(processedData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message || (editingProduct ? 'Product updated!' : 'Product added!'));
        handleCloseModal();
        fetchProducts(); // Refresh products list
      } else {
        setError(data.message || 'Failed to save product');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to save product. Please try again.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/products/seller/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Product deleted successfully!');
        fetchProducts(); // Refresh products list
      } else {
        setError(data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete product. Please try again.');
    }
  };

  return (
    <div className="products-tab">
      {/* Header */}
      <div className="products-tab-header">
        <div>
          <h2>📦 My Products</h2>
          <p>Manage your product listings</p>
        </div>
        <button className="add-product-btn" onClick={handleOpenModal}>
          ➕ Add New Product
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="alert alert-success">
          ✅ {successMessage}
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      {/* Product List */}
      <ProductList
        products={products}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        loading={loading}
      />

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal}>✕</button>
            <ProductForm
              formData={formData}
              editingProduct={editingProduct}
              categories={categories}
              onFormChange={handleFormChange}
              onSubmit={handleSubmit}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
