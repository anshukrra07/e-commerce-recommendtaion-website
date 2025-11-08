# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Full-stack e-commerce platform with separate authentication and approval workflows for Customers, Sellers, and Admins. Built with Express.js backend and React frontend, using MongoDB for data persistence.

## Development Commands

### Prerequisites
- MongoDB must be running: `mongod`
- Node.js installed for both backend and frontend

### Backend (Port 5050)
```bash
cd backend
npm start
```

### ML Service (Port 5002)
```bash
cd ml-service
python3 app.py
```

### Frontend (Port 3000)
```bash
cd frontend1
npm start
npm run build    # Production build
npm test         # Run tests
```

### Database Setup
```bash
# Create admin user (required for first-time setup)
cd backend
node scripts/createAdmin.js

# MongoDB access
mongosh
use ecommercedb
db.customers.find().pretty()
db.sellers.find().pretty()
db.admins.find().pretty()
db.products.find().pretty()
```

### Troubleshooting Commands
```bash
# Kill backend process if port 5050 is in use
lsof -ti:5050 | xargs kill -9

# Kill frontend process if port 3000 is in use
lsof -ti:3000 | xargs kill -9
```

## Architecture

### Backend Structure (MVC Pattern)

**Models** (`backend/models/`)
- `Customer.js` - Customer schema with bcrypt password hashing
- `Seller.js` - Seller schema with approval status (pending/approved/rejected)
- `Admin.js` - Admin schema with pre-defined credentials
- `Product.js` - Product schema with seller reference, approval workflow, and image upload support
- `Review.js` - Review schema for seller ratings and customer feedback
- `ViewHistory.js` - Track customer product views for ML recommendations

**Controllers** (`backend/controllers/`)
- `customerController.js` - Customer signup/login (immediate access)
- `sellerController.js` - Seller signup/login (requires approval)
- `adminController.js` - Seller/product approval, rejection with database deletion
- `productController.js` - CRUD operations with status-based approval workflow + **automatic ML retraining**
- `reviewController.js` - Create, read, update, delete seller reviews
- `analyticsController.js` - Seller analytics and performance metrics
- `recommendationController.js` - ML-based product recommendations (personalized, similar, popular)

**Routes** (`backend/routes/`)
- Protected with JWT authentication middleware (`middleware/auth.js`)
- Role-based access control via `middleware/roleAuth.js`
- RESTful API design under `/api/*` namespace

**Key Backend Features:**
- JWT tokens with 30-day expiration
- Password hashing with bcrypt (10 rounds)
- Multer-based image upload to `uploads/products/` directory
- CORS enabled for frontend communication
- Approval workflow: Product edits reset status to "pending"

### Frontend Structure (React)

**Pages** (`frontend1/src/pages/`)
- `HomePage.js` - Landing page
- `AdminDashboard.js` - Admin panel for seller/product approvals
- `SellerDashboard.js` - Seller panel for product management
- `ProductDetailsPage.js` - Enhanced product view with image gallery
- `ShopPage.js` - Customer product browsing

**Components** (`frontend1/src/components/`)
- `LoginModal/` - Multi-tab modal for Customer/Seller/Admin login/signup
- `SellerComponents/` - Reusable components:
  - `ProductForm.js` - Add/edit products with image upload
  - `ProductList.js` - Display products with status badges
- `SellerTabs/` - Dashboard tabs (Products, Orders, Analytics, etc.)
- `AdminTabs/` - Admin dashboard tabs (Approvals, Accounts, etc.)

**State Management:**
- Authentication via localStorage (authToken, userRole, userData)
- Context API for auth state (`src/context/`)
- Custom hooks in `src/hooks/`

## Key Workflows

### Authentication Flow
1. **Customer**: Signup → Auto-login (no approval needed)
2. **Seller**: Signup (status=pending) → Admin approval → Login enabled
3. **Admin**: Pre-created via script → Direct login

### Product Management Flow
1. Seller creates product → Status: "pending"
2. Admin reviews in Approvals tab
3. Admin approves → Status: "approved" (visible to customers)
4. Admin rejects → Product deleted from database
5. Seller edits product → Status resets to "pending"

### Image Upload Flow
- Seller selects images (max 5, 5MB each, JPG/PNG/GIF/WebP)
- Upload via `POST /api/products/upload-images`
- Images stored in `backend/uploads/products/`
- Served statically at `http://localhost:5050/uploads/products/*`

### Review System Flow
1. Customer visits seller storefront page
2. Views existing reviews (public access)
3. Customer logs in to write review
4. Selects rating (1-5 stars) and writes comment (max 500 chars)
5. Review saved to MongoDB `reviews` collection
6. Customer can edit/delete their own review
7. Reviews display with filter (by rating) and sort (newest/highest/lowest) options
8. Average seller rating calculated and displayed in banner

### ML Recommendation System Flow
1. **Flask ML Service** (Port 5002) trains TF-IDF model on product text (name, description, category)
2. **Automatic Retraining**: Model retrains whenever products are created/updated/approved/deleted
3. **View Tracking**: ProductDetailsPage tracks view duration and saves to MongoDB
4. **Personalized Recommendations**: Based on customer's purchase history + view history
5. **Similar Products**: Content-based filtering using cosine similarity
6. **HomePage**: Shows "Recommended for You" section for logged-in customers
7. **ProductDetailsPage**: Shows ML-based "Similar Products" instead of category-based

## Environment Configuration

### Backend `.env`
```env
MONGO_URI=mongodb://localhost:27017/ecommercedb
JWT_SECRET=supersecretkey123
PORT=5050
FLASK_ML_URL=http://localhost:5002
ADMIN_EMAIL=admin@eshop.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Super Admin
```

### API Base URL
- Backend: `http://localhost:5050/api`
- Frontend uses this for all API calls

## Important Development Notes

### Code Organization Principles
- Keep components under 250 lines
- One CSS file per component (colocated)
- Separate business logic from display logic
- Controllers should be under 300 lines

### Authentication Requirements
- All protected routes require JWT token in Authorization header: `Bearer <token>`
- Seller routes require `isSeller` middleware
- Admin routes require `isAdmin` middleware
- Token stored in localStorage as 'authToken'

### Product Status Values
- `pending` - Awaiting admin approval
- `approved` - Live and visible to customers
- `rejected` - N/A (products are deleted, not marked rejected)

### Image Upload Specifications
- Endpoint: `POST /api/products/upload-images`
- Content-Type: `multipart/form-data`
- Field name: `images` (array)
- Max files: 5
- Max size: 5MB per image
- Allowed formats: JPG, JPEG, PNG, GIF, WebP

## Testing

### Manual Testing Flow (from QUICK_START.md)
1. Start MongoDB
2. Run `node scripts/createAdmin.js` (first time only)
3. Start backend
4. Start frontend
5. Test customer signup → auto-login
6. Test seller signup → pending state
7. Admin login → approve seller
8. Seller login → add products
9. Admin approve products
10. Verify products appear on shop page

### Database Verification
```bash
mongosh
use ecommercedb
db.sellers.countDocuments({ status: "pending" })  # Check pending sellers
db.products.countDocuments({ status: "approved" })  # Check approved products
db.reviews.find().pretty()  # View all seller reviews
db.viewhistories.find().pretty()  # View product view tracking
```

### ML Service Verification
```bash
# Check ML service status
curl http://localhost:5002/

# Test recommendations
curl 'http://localhost:5050/api/recommendations/popular?limit=5'

# Manually trigger retrain
curl -X POST http://localhost:5002/train
```

## Common Issues

### "Cannot connect to MongoDB"
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`

### "401 Unauthorized" errors
- Verify JWT token in localStorage
- Check token expiration (30-day limit)
- Ensure correct role (customer/seller/admin)

### "Port already in use"
- Backend: `lsof -ti:5050 | xargs kill -9`
- Frontend: `lsof -ti:3000 | xargs kill -9`

### Admin login fails
- Run `node scripts/createAdmin.js` to create/reset admin user
- Default: admin@eshop.com / admin123

### Image upload fails
- Check `uploads/products/` directory exists
- Verify file size < 5MB
- Ensure correct file format
- Check seller authentication

## File Naming Conventions
- Components: PascalCase (e.g., `ProductForm.js`)
- Styles: Match component name (e.g., `ProductForm.css`)
- Routes: camelCase (e.g., `productRoutes.js`)
- Controllers: camelCase with suffix (e.g., `productController.js`)

## API Response Format
All API responses follow this structure:
```json
{
  "success": true/false,
  "message": "Human-readable message",
  "data": { /* response data */ }
}
```

## Additional Documentation
- `QUICK_START.md` - Step-by-step setup guide
- `PROJECT_STRUCTURE.md` - Detailed file structure
- `BEST_PRACTICES.md` - Architecture recommendations
- `PRODUCT_MANAGEMENT.md` - Product system details
- `IMAGE_UPLOAD_GUIDE.md` - Image upload feature docs
- `REVIEW_SYSTEM.md` - Complete review system documentation
- `REVIEW_SYSTEM_QUICK_START.md` - Quick guide for using reviews
- `RECOMMENDATION_SYSTEM_GUIDE.md` - ML recommendation system guide
- `AUTO_RETRAIN.md` - Automatic ML retraining documentation
- `ml-service/README.md` - Flask ML service setup
- `backend/API_DOCUMENTATION.md` - Complete API reference
