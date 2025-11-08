# Product Management System

Complete product management system with seller and admin approval workflow.

## 📋 Overview

Sellers can add products which go through an admin approval process before appearing in the store. The system uses modular, small components for better maintainability and future upgrades.

## 🏗️ Architecture

### Backend Components

#### Models
- **Product.js** (`backend/models/Product.js`)
  - Product schema with validation
  - Fields: name, category, price, discount, stock, image, description, seller (ref), status, sold, revenue
  - Status: pending → approved/rejected

#### Controllers
- **productController.js** (`backend/controllers/productController.js`)
  - **Seller Functions**: createProduct, getSellerProducts, updateProduct, deleteProduct
  - **Admin Functions**: getPendingProducts, approveProduct, rejectProduct
  - **Public Function**: getAllApprovedProducts

#### Routes
- **productRoutes.js** (`backend/routes/productRoutes.js`)
  - `POST /api/products/seller` - Create product (Seller)
  - `GET /api/products/seller` - Get seller's products (Seller)
  - `PUT /api/products/seller/:id` - Update product (Seller)
  - `DELETE /api/products/seller/:id` - Delete product (Seller)
  - `GET /api/products/admin/pending` - Get pending products (Admin)
  - `PUT /api/products/admin/:id/approve` - Approve product (Admin)
  - `DELETE /api/products/admin/:id/reject` - Reject product (Admin)
  - `GET /api/products` - Get all approved products (Public)

### Frontend Components

#### Seller Dashboard Components

**1. ProductForm.js** (`frontend1/src/components/SellerComponents/ProductForm.js`)
- Reusable form for adding/editing products
- Props: formData, editingProduct, categories, onFormChange, onSubmit, onClose
- Styles: ProductForm.css

**2. ProductList.js** (`frontend1/src/components/SellerComponents/ProductList.js`)
- Displays seller's products with status badges
- Props: products, onEdit, onDelete, loading
- Features:
  - Status indicators (Approved ✅, Pending ⏳, Rejected ❌)
  - Stock warnings for low inventory
  - Revenue and sales stats
  - Edit/Delete actions
- Styles: ProductList.css

**3. ProductsTab.js** (`frontend1/src/components/SellerTabs/ProductsTab.js`)
- Main tab component with full CRUD operations
- Manages its own state (no props needed from parent)
- Features:
  - Fetches products from API on mount
  - Modal for add/edit forms
  - Success/error message handling
  - Auto-refresh after operations
- Styles: ProductsTabNew.css

#### Admin Dashboard

**AdminDashboard.js** (`frontend1/src/pages/AdminDashboard.js`)
- Fetches pending products from API
- Approval/rejection with admin authentication
- Integrated with existing seller approval workflow

## 🔄 Workflow

### For Sellers

1. **Add Product**
   - Click "Add New Product" in Products tab
   - Fill form (name, category, price, discount, stock, image, description)
   - Submit → Product status = "pending"

2. **Edit Product**
   - Click "Edit" on any product
   - Update fields
   - Submit → Status reset to "pending" (requires re-approval)

3. **Delete Product**
   - Click "Delete" on any product
   - Confirm → Product removed from database

4. **View Status**
   - ✅ Approved: Product is live on the store
   - ⏳ Pending: Awaiting admin approval
   - ❌ Rejected: Product was rejected (seller can delete and resubmit)

### For Admins

1. **Review Pending Products**
   - Navigate to "Approvals" tab
   - View pending products with seller details

2. **Approve Product**
   - Click "Approve" → Product status = "approved"
   - Product becomes visible to customers

3. **Reject Product**
   - Click "Reject" → Enter rejection reason
   - Product deleted from database
   - Seller notified (via alert)

## 🎨 Design Principles

✅ **Modular Components** - Small, focused components for easy maintenance
✅ **Separation of Concerns** - Business logic separate from UI
✅ **API-First** - All operations through REST API
✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **Status Indicators** - Clear visual feedback with badges
✅ **Error Handling** - Graceful error messages and validation
✅ **Loading States** - Spinner and loading indicators

## 📝 API Examples

### Create Product (Seller)
```javascript
POST /api/products/seller
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Wireless Headphones",
  "category": "electronics",
  "price": 2999,
  "discount": 15,
  "stock": 50,
  "image": "🎧",
  "description": "Premium wireless headphones with noise cancellation"
}
```

### Get Seller Products
```javascript
GET /api/products/seller
Authorization: Bearer <token>

Response: {
  "success": true,
  "count": 5,
  "products": [...]
}
```

### Approve Product (Admin)
```javascript
PUT /api/products/admin/:id/approve
Authorization: Bearer <token>

Response: {
  "success": true,
  "message": "Product approved successfully",
  "product": {...}
}
```

## 🚀 Future Enhancements

- [ ] Image upload functionality (currently uses emojis)
- [ ] Product categories management
- [ ] Bulk operations (approve/reject multiple)
- [ ] Product variations (size, color, etc.)
- [ ] Inventory alerts for low stock
- [ ] Product analytics dashboard
- [ ] Search and filter in product list
- [ ] Export products to CSV/Excel

## 🛠️ Development Notes

- All components use functional components with hooks
- State management is local (no Redux/Context needed yet)
- Authentication uses JWT tokens from localStorage
- API base URL: `http://localhost:5050/api`
- Follows existing project conventions and styling

## 📦 File Structure

```
backend/
├── models/
│   └── Product.js
├── controllers/
│   └── productController.js
└── routes/
    └── productRoutes.js

frontend1/
├── components/
│   └── SellerComponents/
│       ├── ProductForm.js
│       └── ProductList.js
│   └── SellerTabs/
│       └── ProductsTab.js
└── styles/
    └── SellerComponents/
        ├── ProductForm.css
        ├── ProductList.css
        └── ProductsTabNew.css
```

## ✅ Testing Checklist

- [ ] Seller can create product
- [ ] Seller can view their products
- [ ] Seller can edit product (status resets to pending)
- [ ] Seller can delete product
- [ ] Admin can view pending products
- [ ] Admin can approve product
- [ ] Admin can reject product
- [ ] Status badges display correctly
- [ ] Form validation works
- [ ] Success/error messages appear
- [ ] Mobile responsive design works
- [ ] Loading states display correctly

---

**Created**: 2025-01-06
**Last Updated**: 2025-01-06
