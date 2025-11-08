# 🌟 Seller Review System Documentation

## Overview

The e-commerce platform now has a fully functional review system that allows **customers** to rate and review **sellers** on the SellerStorefront page. Reviews are stored in MongoDB and displayed to all visitors.

---

## 📋 Features

### For Customers
- ⭐ Rate sellers from 1 to 5 stars
- 💬 Write detailed reviews (up to 500 characters)
- ✏️ Edit their own reviews
- 🗑️ Delete their own reviews
- 👁️ View all reviews for a seller
- 🔍 Filter reviews by rating
- 📊 Sort reviews by newest, highest, or lowest rating

### For All Users (Public)
- 📖 View all reviews for any seller
- 📈 See average seller rating
- 📊 See total number of reviews
- 🔍 Filter and sort reviews

### Business Rules
- ✅ Only **logged-in customers** can write reviews
- 🚫 Customers can only review **approved sellers**
- 📝 One review per customer per seller
- 🔒 Customers can only edit/delete their own reviews

---

## 🗄️ Database Schema

### Review Model (`backend/models/Review.js`)

```javascript
{
  seller: ObjectId,        // Reference to Seller
  customer: ObjectId,      // Reference to Customer
  rating: Number,          // 1-5 (required)
  comment: String,         // Max 500 chars (required)
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-generated
}
```

**Indexes:**
- `{ seller: 1, createdAt: -1 }` - For fast seller review queries

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5050/api/reviews
```

### 1. Get All Reviews for a Seller
**GET** `/seller/:sellerId`

**Access:** Public

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "review_id",
        "seller": "seller_id",
        "customer": {
          "_id": "customer_id",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "rating": 5,
        "comment": "Excellent seller! Fast shipping.",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "totalReviews": 15,
    "averageRating": 4.7
  }
}
```

---

### 2. Get My Review for a Seller
**GET** `/seller/:sellerId/my-review`

**Access:** Private (Customer only)

**Headers:**
```
Authorization: Bearer <customer_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "review_id",
    "rating": 5,
    "comment": "Great experience!",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 3. Create a Review
**POST** `/`

**Access:** Private (Customer only)

**Headers:**
```
Authorization: Bearer <customer_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sellerId": "seller_id_here",
  "rating": 5,
  "comment": "Excellent service and fast delivery!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    "_id": "new_review_id",
    "seller": "seller_id",
    "customer": {
      "_id": "customer_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "rating": 5,
    "comment": "Excellent service and fast delivery!",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Validation:**
- `sellerId` - Required
- `rating` - Required, must be 1-5
- `comment` - Required, max 500 characters
- Seller must exist and be approved
- Customer cannot have already reviewed this seller

---

### 4. Update a Review
**PUT** `/:reviewId`

**Access:** Private (Customer only - own review)

**Headers:**
```
Authorization: Bearer <customer_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated: Good service overall"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "_id": "review_id",
    "rating": 4,
    "comment": "Updated: Good service overall",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
}
```

---

### 5. Delete a Review
**DELETE** `/:reviewId`

**Access:** Private (Customer only - own review)

**Headers:**
```
Authorization: Bearer <customer_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## 🎨 Frontend Implementation

### Location
`frontend1/src/seller/pages/SellerStorefront.js`

### UI Components

#### 1. **Review Form** (For customers who haven't reviewed)
- Star rating selector (1-5 stars)
- Text area for comment (500 char limit)
- Submit button
- Shows only when logged in as customer and no existing review

#### 2. **My Review Section** (For customers who have reviewed)
- Display of customer's own review
- Edit button (opens edit form)
- Delete button (with confirmation)
- Shows only when customer has already reviewed

#### 3. **Reviews List**
- All reviews displayed in card format
- Shows customer name, rating, comment, and date
- Filter dropdown (by rating: all, 5★, 4★, 3★, 2★, 1★)
- Sort dropdown (newest, highest rating, lowest rating)
- Displays total review count
- Shows "No reviews" message if empty

#### 4. **Seller Banner Stats**
- Average rating display: ⭐ 4.7 (15 reviews)
- Visible at the top of the page

---

## 🔐 Authentication Flow

1. **Customer must be logged in** to write/edit/delete reviews
2. If not logged in, clicking to review prompts login modal
3. JWT token stored in localStorage: `authToken`
4. Token sent in Authorization header: `Bearer <token>`
5. Backend verifies token and extracts customer ID

---

## 📊 Usage Example

### Customer Journey

1. **Browse seller storefront**
   - Customer visits: `/shop/:sellerKey`
   - Sees seller's products and existing reviews

2. **Read existing reviews**
   - Views all reviews with ratings
   - Can filter by star rating
   - Can sort by date or rating

3. **Write a review** (if logged in)
   - Clicks on star rating (1-5)
   - Types comment in text area
   - Submits review
   - Review appears in "My Review" section

4. **Edit review** (optional)
   - Clicks "Edit" button
   - Modifies rating/comment
   - Saves changes

5. **Delete review** (optional)
   - Clicks "Delete" button
   - Confirms deletion
   - Review removed from system

---

## 🧪 Testing the System

### Prerequisites
1. Backend running on port 5050
2. Frontend running on port 3000
3. MongoDB connected

### Test Steps

#### 1. Test as Visitor (Not Logged In)
```bash
# View seller reviews (public endpoint)
curl http://localhost:5050/api/reviews/seller/<seller_id>
```

#### 2. Test as Customer (Logged In)

**Create a review:**
```bash
curl -X POST http://localhost:5050/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <customer_token>" \
  -d '{
    "sellerId": "<seller_id>",
    "rating": 5,
    "comment": "Great seller!"
  }'
```

**Get my review:**
```bash
curl http://localhost:5050/api/reviews/seller/<seller_id>/my-review \
  -H "Authorization: Bearer <customer_token>"
```

**Update review:**
```bash
curl -X PUT http://localhost:5050/api/reviews/<review_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <customer_token>" \
  -d '{
    "rating": 4,
    "comment": "Updated review"
  }'
```

**Delete review:**
```bash
curl -X DELETE http://localhost:5050/api/reviews/<review_id> \
  -H "Authorization: Bearer <customer_token>"
```

---

## 🎯 How to Access

### Via Frontend
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend1 && npm start`
3. Visit: `http://localhost:3000`
4. Login as a **customer**
5. Navigate to any seller's storefront
6. Scroll down to "Customer Reviews" section
7. Write, edit, or delete your review

### Direct URL Pattern
```
http://localhost:3000/shop/:sellerKey
```

Example:
```
http://localhost:3000/shop/elite-electronics
```

---

## 🔧 Configuration

### Environment Variables
No additional environment variables needed. Reviews use existing database connection.

### Database Connection
Reviews are stored in the same MongoDB database as other collections:
- Database: `ecommercedb` (or value from `MONGO_URI`)
- Collection: `reviews`

---

## 🚀 Key Features in Action

### Seller Rating Display
- **Location:** Top banner of SellerStorefront
- **Format:** ⭐ 4.7 (15 reviews)
- **Updates:** Real-time after new reviews

### Review Statistics
- **Average Rating:** Calculated from all reviews
- **Total Reviews:** Count of all reviews
- **Rating Distribution:** Visible via filter options

### Real-time Updates
- After submitting a review → Refreshes review list
- After editing a review → Updates display immediately
- After deleting a review → Removes from list instantly

---

## 📝 Code Architecture

### Backend Structure
```
backend/
├── models/
│   └── Review.js              # Review schema
├── controllers/
│   └── reviewController.js    # Review business logic
├── routes/
│   └── reviewRoutes.js        # Review API routes
└── middleware/
    └── auth.js                # JWT authentication
```

### Frontend Structure
```
frontend1/src/
└── seller/
    ├── pages/
    │   └── SellerStorefront.js  # Review UI implementation
    └── styles/
        └── SellerStorefront.css # Review styling
```

---

## 🎨 Styling

Reviews use the existing SellerStorefront.css styles:
- `.reviews-section` - Main container
- `.review-form-container` - Review form wrapper
- `.review-item` - Individual review card
- `.stars-input` - Star rating selector
- `.review-comment` - Review text display

---

## ✅ Success!

Your e-commerce platform now has a **complete review system**! Customers can:
- ⭐ Rate sellers
- 💬 Share their experiences
- ✏️ Manage their reviews
- 📊 Help other customers make informed decisions

All review data is **securely stored in MongoDB** and accessible via a **RESTful API**.
