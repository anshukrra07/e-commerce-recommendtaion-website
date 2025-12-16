# 🤖 ML Recommendation System - Complete Guide

## ✅ What's Been Built

You now have a complete **AI-powered product recommendation system** using:
- **Flask + TF-IDF + Cosine Similarity** for ML
- **Express backend** integration
- **MongoDB** for tracking user behavior
- **1-hour caching** for performance

---

## 🎯 Current Status

### ✅ Completed:
1. **Flask ML Service** (Port 5002)
   - TF-IDF model trained on 55 products
   - Content-based filtering using product descriptions
   - Cosine similarity for finding similar products
   - Personalized recommendations based on purchase/view history

2. **Express Backend** (Port 5050)
   - `/api/recommendations/:customerId` - Personalized recommendations
   - `/api/recommendations/similar/:productId` - Similar products
   - `/api/recommendations/popular` - Trending products
   - `/api/recommendations/track-view` - Track product views
   - `/api/recommendations/retrain` - Retrain ML model

3. **MongoDB Models**
   - ViewHistory model for tracking product views

---

## 🚀 How to Use

### 1. Start Services

**Terminal 1 - MongoDB:**
```bash
mongod
```

**Terminal 2 - Flask ML Service:**
```bash
cd ml-service
python3 app.py
```

**Terminal 3 - Express Backend:**
```bash
cd backend
npm start
```

**Terminal 4 - React Frontend:**
```bash
cd frontend1
npm start
```

---

## 📡 API Endpoints

### Get Personalized Recommendations
```bash
GET http://localhost:5050/api/recommendations/:customerId?limit=10
```

**Example:**
```bash
curl 'http://localhost:5050/api/recommendations/690cf9c59ce8969e8d504246?limit=10'
```

**Response:**
```json
{
  "success": true,
  "source": "ml",
  "products": [
    {
      "_id": "...",
      "name": "Product Name",
      "category": "electronics",
      "price": 1999,
      "mlScore": 2.45
    }
  ],
  "count": 10
}
```

### Get Similar Products
```bash
GET http://localhost:5050/api/recommendations/similar/:productId?limit=10
```

### Get Popular Products
```bash
GET http://localhost:5050/api/recommendations/popular?limit=10
```

### Track Product View (Protected - Requires Auth)
```bash
POST http://localhost:5050/api/recommendations/track-view
Headers: Authorization: Bearer <token>
Body: {
  "productId": "690d7c04598ed1ebcbdce404",
  "duration": 30
}
```

### Retrain ML Model (Admin Only)
```bash
POST http://localhost:5050/api/recommendations/retrain
Headers: Authorization: Bearer <admin_token>
```

---

## 🎨 Frontend Integration (Next Steps)

### Step 1: Add View Tracking to ProductDetailsPage

```javascript
// In ProductDetailsPage.js
import { useEffect } from 'react';

useEffect(() => {
  // Track page view
  const startTime = Date.now();
  
  // Track view when customer is logged in
  if (isLoggedIn && userRole === 'customer' && product?.id) {
    const trackView = async () => {
      const token = localStorage.getItem('authToken');
      await fetch('http://localhost:5050/api/recommendations/track-view', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product.id,
          duration: Math.floor((Date.now() - startTime) / 1000)
        })
      });
    };
    
    // Track when user leaves page
    return () => {
      trackView();
    };
  }
}, [product, isLoggedIn, userRole]);
```

### Step 2: Add "Recommended for You" Section to HomePage

```javascript
// In HomePage.js
const [recommendations, setRecommendations] = useState([]);

useEffect(() => {
  const fetchRecommendations = async () => {
    if (isLoggedIn && userRole === 'customer') {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const res = await fetch(
        `http://localhost:5050/api/recommendations/${userData.id}?limit=10`
      );
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.products);
      }
    }
  };
  fetchRecommendations();
}, [isLoggedIn, userRole]);

// Display recommendations
{recommendations.length > 0 && (
  <ProductSection
    title="🎯 Recommended for You"
    products={recommendations}
    category="Recommended"
    categoryId="recommendations"
    gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  />
)}
```

### Step 3: Add "Similar Products" to ProductDetailsPage

```javascript
// In ProductDetailsPage.js
const [similarProducts, setSimilarProducts] = useState([]);

useEffect(() => {
  const fetchSimilar = async () => {
    const res = await fetch(
      `http://localhost:5050/api/recommendations/similar/${productId}?limit=6`
    );
    const data = await res.json();
    if (data.success) {
      setSimilarProducts(data.products);
    }
  };
  if (productId) fetchSimilar();
}, [productId]);

// Display below product details
{similarProducts.length > 0 && (
  <div className="similar-products-section">
    <h2>Similar Products</h2>
    <div className="products-grid">
      {similarProducts.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  </div>
)}
```

---

## 🧠 How It Works

### Content-Based Filtering
1. **Text Features**: Combines product name + description + category
2. **TF-IDF**: Converts text to numerical vectors
3. **Cosine Similarity**: Measures similarity between products (0-1 score)

### Personalization Logic
```
1. Get customer's purchase history (highest weight: 1.5x)
2. Get customer's view history (normal weight: 1.0x)
3. For each interacted product:
   - Find similar products using cosine similarity
   - Accumulate similarity scores
4. Remove already-viewed/purchased products
5. Sort by total score
6. Return top N recommendations
```

### Example:
```
Customer viewed: "Gaming Laptop"
ML finds similar: 
  - "Gaming Mouse" (similarity: 0.85)
  - "Mechanical Keyboard" (similarity: 0.78)
  - "Gaming Headset" (similarity: 0.72)

Customer also purchased: "iPhone"
ML finds similar:
  - "iPhone Case" (similarity: 0.92 × 1.5 = 1.38)  ← Higher score
  - "AirPods" (similarity: 0.88 × 1.5 = 1.32)
  
Final recommendations ranked by score:
1. iPhone Case (1.38)
2. AirPods (1.32)
3. Gaming Mouse (0.85)
4. Mechanical Keyboard (0.78)
```

---

## 🔄 Retraining the Model

**When to retrain:**
- New products added
- Product descriptions updated
- Weekly/monthly schedule

**How to retrain:**
```bash
curl -X POST http://localhost:5050/api/recommendations/retrain \
  -H "Authorization: Bearer <admin_token>"
```

Or automatically via cron job:
```bash
# Add to crontab (retrain daily at 2 AM)
0 2 * * * curl -X POST http://localhost:5050/api/recommendations/retrain \
  -H "Authorization: Bearer <admin_token>"
```

---

## 📊 Performance

- **Training time**: ~1-2 seconds for 100 products
- **Prediction time**: ~10-50ms per request
- **Cache duration**: 1 hour
- **Fallback**: Shows popular products if ML fails

---

##  Testing

### Test Personalized Recommendations
```bash
# Replace with actual customer ID
curl 'http://localhost:5050/api/recommendations/690cf9c59ce8969e8d504246?limit=5'
```

### Test Similar Products
```bash
# Replace with actual product ID
curl 'http://localhost:5050/api/recommendations/similar/690d7c04598ed1ebcbdce404?limit=5'
```

### Test Popular Products
```bash
curl 'http://localhost:5050/api/recommendations/popular?limit=10'
```

---

## 🐛 Troubleshooting

### Flask Service Not Running
```bash
cd ml-service
python3 app.py
```

### "ML service unavailable" Error
- Check Flask is running on port 5002: `curl http://localhost:5002/`
- Check logs: `tail -f ml-service/flask.log`
- Backend will automatically fall back to popular products

### No Recommendations Returned
- User has no purchase/view history → Shows popular products
- Check MongoDB has approved products: `mongosh ecommercedb`
  ```js
  db.products.countDocuments({status: 'approved'})
  ```

### "Model not loaded"
- Retrain model: `curl -X POST http://localhost:5002/train`
- Check products exist in database

---

## 📈 Next Improvements

1. **Search History Tracking** - Track what customers search for
2. **Click Tracking** - Track which recommendations are clicked
3. **A/B Testing** - Compare ML vs simple recommendations
4. **Collaborative Filtering** - "Users who bought X also bought Y"
5. **Hybrid Approach** - Combine content-based + collaborative filtering

---

## 🎉 Summary

You now have:
- ✅ Flask ML service with TF-IDF + Cosine Similarity
- ✅ Express API integration with caching
- ✅ View history tracking
- ✅ Personalized recommendations based on behavior
- ✅ Similar products feature
- ✅ Popular/trending products
- ✅ Automatic fallback for reliability

**Next: Add frontend components to display recommendations!**

---

## 📞 Quick Reference

- **Flask ML Service**: http://localhost:5002
- **Express Backend**: http://localhost:5050
- **Frontend**: http://localhost:3000

**Key Files:**
- `/ml-service/app.py` - Flask ML service
- `/backend/controllers/recommendationController.js` - Express integration
- `/backend/routes/recommendationRoutes.js` - API routes
- `/backend/models/ViewHistory.js` - View tracking model
