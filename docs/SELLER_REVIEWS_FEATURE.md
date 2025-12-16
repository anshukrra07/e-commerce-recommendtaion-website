# Seller Reviews Feature

## Overview
This document describes the seller review feature that has been added to the e-commerce platform. Customers can now leave reviews and ratings for sellers, and all users can view seller reviews on the seller storefront page.

## Backend Changes

### 1. Review Model (`backend/models/Review.js`)
- **Fields:**
  - `seller`: Reference to Seller (ObjectId)
  - `customer`: Reference to Customer (ObjectId)
  - `rating`: Number (1-5)
  - `comment`: String (max 500 characters)
  - `createdAt`: Date (auto-generated)
- **Validation:**
  - Rating must be between 1 and 5
  - Comment is required and limited to 500 characters
- **Index:** Created on `seller` and `createdAt` for faster queries

### 2. Review Controller (`backend/controllers/reviewController.js`)
**Endpoints:**
- `addReview`: Create a new review (Customer only, one review per seller)
- `getSellerReviews`: Get all reviews for a seller (Public)
- `updateReview`: Update own review (Customer only)
- `deleteReview`: Delete own review (Customer only)
- `getMyReviewForSeller`: Get logged-in customer's review for a seller

**Features:**
- Prevents duplicate reviews from same customer
- Only approved sellers can be reviewed
- Calculates average rating automatically
- Includes customer information in reviews

### 3. Review Routes (`backend/routes/reviewRoutes.js`)
- `POST /api/reviews` - Add review (Protected)
- `GET /api/reviews/seller/:sellerId` - Get seller reviews (Public)
- `PUT /api/reviews/:reviewId` - Update review (Protected)
- `DELETE /api/reviews/:reviewId` - Delete review (Protected)
- `GET /api/reviews/seller/:sellerId/my-review` - Get my review (Protected)

### 4. Seller Controller Updates
Added `getSellerById` endpoint:
- `GET /api/sellers/:sellerId` - Get public seller information
- Returns only approved sellers
- Excludes password from response

### 5. Server Configuration
Registered review routes in `server.js`:
```javascript
app.use("/api/reviews", reviewRoutes);
```

## Frontend Changes

### 1. SellerStorefront Component Updates
**Data Fetching:**
- Fetches real seller data from API instead of mock data
- Fetches seller's approved products
- Fetches seller reviews and ratings
- Fetches logged-in customer's review (if applicable)

**Dynamic Features:**
- Displays seller business name, owner, email, and join date
- Shows real-time product count
- Displays average rating and total review count
- Filters products by category dynamically
- Loading states for better UX

### 2. Review Section Features
**Review Form (Customers only):**
- Star rating selector (1-5 stars)
- Comment textarea (500 character limit)
- Character counter
- Submit button with loading state
- Only shown if customer hasn't reviewed yet

**Review Display:**
- Shows all customer reviews
- Displays reviewer name, rating, date, and comment
- Highlights logged-in customer's own review
- "No reviews" message when empty
- Responsive grid layout

**Access Control:**
- Login prompt for non-logged-in users
- Only customers can submit reviews
- One review per customer per seller
- Real-time review refresh after submission

### 3. CSS Styling
Added comprehensive styles for:
- Review section container
- Review form with star rating input
- Individual review cards
- Hover effects and transitions
- Responsive design for mobile devices
- Login prompt styling
- My review highlight

## User Flows

### Customer Flow
1. Navigate to seller storefront
2. View seller products and existing reviews
3. Click on star rating to select rating (1-5)
4. Write review comment
5. Submit review
6. Review appears in "Your Review" section
7. Review appears in public reviews list

### Guest User Flow
1. Navigate to seller storefront
2. View seller products and existing reviews
3. See login prompt to leave a review
4. Click login to access review form

### Seller Flow
- Sellers cannot review themselves
- Sellers can see all reviews on their storefront
- Reviews help build seller reputation

## API Usage Examples

### Get Seller Reviews
```javascript
GET /api/reviews/seller/:sellerId
Response: {
  success: true,
  data: {
    reviews: [...],
    totalReviews: 10,
    averageRating: 4.5
  }
}
```

### Submit Review
```javascript
POST /api/reviews
Headers: { Authorization: "Bearer <token>" }
Body: {
  sellerId: "seller_id",
  rating: 5,
  comment: "Great seller!"
}
Response: {
  success: true,
  message: "Review added successfully",
  data: { ...review }
}
```

## Database Schema

### Review Collection
```javascript
{
  _id: ObjectId,
  seller: ObjectId (ref: Seller),
  customer: ObjectId (ref: Customer),
  rating: Number (1-5),
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Validation Rules
- Customer must be logged in to review
- Customer can only review each seller once
- Seller must be approved
- Rating: 1-5 (required)
- Comment: 1-500 characters (required)

## Security Features
- JWT authentication for review submission
- User can only update/delete their own reviews
- Seller approval check before accepting reviews
- Input validation and sanitization

## Future Enhancements
- Edit review functionality
- Delete review option
- Review reply system (seller responses)
- Helpful/not helpful voting on reviews
- Report inappropriate reviews
- Review photos/images
- Sort reviews by date/rating
- Filter reviews by rating
- Review moderation by admin

## Testing Recommendations
1. Test customer review submission
2. Verify one-review-per-seller constraint
3. Test review display for different sellers
4. Verify average rating calculation
5. Test login prompt for guests
6. Test responsive design on mobile
7. Verify sellers cannot review themselves
8. Test review refresh after submission

## Notes
- Reviews are tied to seller accounts, not products
- Average rating is calculated in real-time
- Reviews require both rating and comment
- System prevents duplicate reviews automatically
