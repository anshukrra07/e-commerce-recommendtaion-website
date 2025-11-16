# ML-Service Data Flow & Architecture

## Overview
The ML-Service is a Flask-based recommendation engine that uses TF-IDF (Term Frequency-Inverse Document Frequency) and cosine similarity to provide intelligent product recommendations.

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ML-Service (Port 5002)                   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         MongoDB (Data Source)                        │   │
│  │  • Products Collection (approved products only)      │   │
│  │  • Orders Collection (user purchase history)         │   │
│  │  • ViewHistories Collection (user view history)      │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                       │
│                       ▼                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Data Loading & Preprocessing                       │   │
│  │  • load_products_from_db()                           │   │
│  │  • Extract features (name, description, category)    │   │
│  │  • Combine into "combined_features" text             │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                       │
│                       ▼                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    Model Training (TF-IDF Vectorizer)                │   │
│  │  • train_model()                                     │   │
│  │  • Max features: 1000                                │   │
│  │  • Unigrams + Bigrams (1,2)                          │   │
│  │  • Compute similarity matrix                         │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                       │
│                       ▼                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    Model Persistence                                 │   │
│  │  • Save to /models folder (pickle format)            │   │
│  │  • tfidf_vectorizer.pkl                              │   │
│  │  • product_vectors.pkl                               │   │
│  │  • products_df.pkl                                   │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                       │
│                       ▼                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    API Endpoints (Recommendation Requests)           │   │
│  │  • /recommendations/similar/<product_id>             │   │
│  │  • /recommendations/user/<customer_id>               │   │
│  │  • /recommendations/popular                          │   │
│  │  • /train (retrain model with new data)              │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                       │
└───────────────────────┼───────────────────────────────────────┘
                        │
                        ▼
                  ┌──────────────┐
                  │   Backend    │
                  │ (Port 5050)  │
                  └──────┬───────┘
                         │
                         ▼
                   ┌──────────────┐
                   │   Frontend   │
                   │ (Port 3000)  │
                   └──────────────┘
```

## 1. Data Fetching from MongoDB

### Source Collections

#### a) **Products Collection** (Primary data source)
```python
products = list(db.products.find({'status': 'approved'}))
```

**Fields extracted:**
- `_id` - Product ID
- `name` - Product name
- `description` - Detailed description
- `category` - Product category
- `keyFeatures` - Array of key features
- `specifications` - Dictionary of technical specs
- `price` - Product price
- `sold` - Number of units sold (for popularity)

**Example document:**
```json
{
  "_id": ObjectId("..."),
  "name": "Samsung Galaxy S21",
  "description": "Latest flagship smartphone",
  "category": "Electronics",
  "keyFeatures": ["5G", "120Hz Display", "Triple Camera"],
  "specifications": {
    "processor": "Snapdragon 888",
    "ram": "8GB",
    "storage": "256GB"
  },
  "price": 79999,
  "status": "approved",
  "sold": 250
}
```

#### b) **Orders Collection** (User purchase history)
```python
orders = list(db.orders.find({
    'customer': ObjectId(customer_id),
    'paymentStatus': 'paid'
}))
```

**Used for:**
- Getting products purchased by user
- Boosting recommendation scores (1.5x multiplier)
- Personalizing recommendations

#### c) **ViewHistories Collection** (User browsing history)
```python
views = list(db.viewhistories.find({
    'customer': ObjectId(customer_id)
}).sort('createdAt', -1).limit(20))
```

**Used for:**
- Last 20 viewed products
- Understanding user interests
- Generating personalized recommendations

## 2. Data Processing Pipeline

### Step 1: Load Products from Database
```python
def load_products_from_db():
    products = list(db.products.find({'status': 'approved'}))
    df = pd.DataFrame(products)
```

**Transformations:**
```python
# Convert ObjectId to string
df['_id'] = df['_id'].astype(str)

# Extract list features as text
df['keyFeatures_text'] = df['keyFeatures'].apply(
    lambda x: ' '.join(x) if isinstance(x, list) else ''
)
# Example: ['5G', '120Hz', 'Camera'] → '5G 120Hz Camera'

# Extract dictionary features as text
df['specifications_text'] = df['specifications'].apply(
    lambda x: ' '.join(str(v) for v in x.values()) if isinstance(x, dict) else ''
)
# Example: {'processor': 'Snapdragon'} → 'Snapdragon'
```

### Step 2: Create Combined Features
```python
df['combined_features'] = (
    df['name'].fillna('') + ' ' +
    df['description'].fillna('') + ' ' +
    df['category'].fillna('') + ' ' +
    df['category'].fillna('') + ' ' +  # Boost category weight
    df['keyFeatures_text'].fillna('') + ' ' +
    df['specifications_text'].fillna('')
)
```

**Example result for Samsung Galaxy S21:**
```
"Samsung Galaxy S21 Latest flagship smartphone Electronics Electronics 5G 120Hz Display Triple Camera 
Snapdragon 888 8GB 256GB"
```

### Step 3: TF-IDF Vectorization
```python
tfidf_vectorizer = TfidfVectorizer(
    max_features=1000,      # Keep top 1000 terms
    stop_words='english',   # Remove common words (the, is, etc)
    ngram_range=(1, 2),     # Use single words and 2-word phrases
    min_df=1                # Minimum document frequency
)

product_vectors = tfidf_vectorizer.fit_transform(
    df['combined_features']
)
```

**Result:** Dense matrix of shape (num_products, 1000)
- Each row = product
- Each column = TF-IDF score for a term
- Higher score = more relevant term for that product

### Step 4: Model Storage
```python
# Save to disk for fast loading on restart
with open('models/tfidf_vectorizer.pkl', 'wb') as f:
    pickle.dump(tfidf_vectorizer, f)

with open('models/product_vectors.pkl', 'wb') as f:
    pickle.dump(product_vectors, f)

products_df.to_pickle('models/products_df.pkl')
```

## 3. Recommendation Algorithms

### Algorithm 1: Similar Products (Content-Based)
```python
def get_similar_products(product_id, top_n=10):
    # Find index of product
    product_idx = products_df[products_df['_id'] == product_id].index[0]
    
    # Calculate cosine similarity between this product and all others
    similarities = cosine_similarity(
        product_vectors[product_idx], 
        product_vectors
    ).flatten()
    
    # Get top N (excluding itself)
    similar_indices = similarities.argsort()[::-1][1:top_n+1]
    
    return products with highest similarity scores
```

**How it works:**
- Compares product features (TF-IDF vectors)
- Returns products most similar to the given product
- Used on ProductDetailsPage (shows "Similar Products" widget)

**Example:**
- User viewing "Samsung Galaxy S21"
- System finds products with similar features
- Returns: Other phones with 5G, high refresh rate, multiple cameras

### Algorithm 2: Personalized Recommendations (Hybrid)
```python
def get_user_recommendations(customer_id, top_n=10):
    # Get user's purchase history
    purchased_products = [products from paid orders]
    
    # Get user's view history
    viewed_products = [last 20 products viewed]
    
    # Combine both
    interacted_products = purchased_products + viewed_products
    
    # For each interacted product, find similar products
    for prod_id in interacted_products[:5]:
        similar = get_similar_products(prod_id, top_n=20)
        
        for item in similar:
            # Boost score for purchased items (1.5x)
            if prod_id in purchased_products:
                score *= 1.5
            
            # Accumulate scores
            all_recommendations[item_id] += score
    
    # Remove products user already interacted with
    # Return top N by accumulated score
    return sorted_recommendations
```

**How it works:**
- Analyzes user's purchase & view history
- Finds products similar to what user has interacted with
- Boosts scores for purchased items (stronger signal)
- Removes products already seen/bought
- Returns personalized ranking

**Example:**
- User purchased: Laptop, Mouse
- User viewed: Gaming headset, Monitor
- System finds products similar to all 4
- Returns: Keyboard, Gaming chair, USB hub, etc.

### Algorithm 3: Popular Products (Fallback)
```python
def get_popular_products(top_n=10):
    popular = list(db.products.find({
        'status': 'approved'
    }).sort('sold', -1).limit(top_n))
    
    return top products by sales count
```

**Used when:**
- New user (no purchase/view history)
- Error in other algorithms
- Fallback recommendation

## 4. API Endpoints

### Endpoint 1: Similar Products
```
GET /recommendations/similar/<product_id>?limit=10
```

**Request:**
```
GET /recommendations/similar/507f1f77bcf86cd799439011?limit=8
```

**Response:**
```json
{
  "success": true,
  "productId": "507f1f77bcf86cd799439011",
  "recommendations": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "score": 0.8534,
      "name": "Samsung Galaxy S22",
      "category": "Electronics"
    },
    ...
  ],
  "count": 8
}
```

**Called by:**
- ProductDetailsPage (similar products section)
- Backend recommendationController.js

---

### Endpoint 2: Personalized User Recommendations
```
GET /recommendations/user/<customer_id>?limit=10
```

**Request:**
```
GET /recommendations/user/507f1f77bcf86cd799439011?limit=10
```

**Response:**
```json
{
  "success": true,
  "customerId": "507f1f77bcf86cd799439011",
  "recommendations": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "score": 2.5678,
      "name": "Gaming Monitor",
      "category": "Electronics"
    },
    ...
  ],
  "count": 10
}
```

**Called by:**
- HomePage (personalized recommendations)
- Customer dashboard

---

### Endpoint 3: Popular Products
```
GET /recommendations/popular?limit=10
```

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "productId": "507f1f77bcf86cd799439012",
      "score": 500,
      "name": "Best Selling Product",
      "category": "Electronics"
    },
    ...
  ],
  "count": 10
}
```

**Called by:**
- Trending section
- New user recommendations

---

### Endpoint 4: Retrain Model
```
POST /train
```

**Request:** `POST /train`

**Response:**
```json
{
  "success": true,
  "message": "Model trained successfully",
  "products_count": 1234
}
```

**When to call:**
- New products added to database
- Periodic retraining (daily/weekly)
- Manual trigger from admin

**Called by:**
- Backend (after new products approved)
- Scheduled jobs
- Admin dashboard

---

### Endpoint 5: Status Check
```
GET /
```

**Response:**
```json
{
  "service": "E-commerce ML Recommendation Service",
  "status": "running",
  "model_loaded": true,
  "products_count": 1234
}
```

## 5. Data Flow Example: User Views Product

```
User clicks on "Samsung Galaxy S21"
    ↓
Frontend calls Backend API
    ↓
Backend: GET /api/products/{id}
    ├→ Returns product details from MongoDB
    └→ Calls ML-Service in background
    ↓
ML-Service: GET /recommendations/similar/507f...?limit=8
    ├→ Loads product vector from memory
    ├→ Calculates cosine similarity with all products
    ├→ Gets top 8 similar products
    └→ Returns results
    ↓
Frontend displays "Similar Products" widget
```

## 6. Model Lifecycle

### Startup Flow
```
1. ML-Service starts
2. load_model() called
3. Check if models/ folder exists
4. If exists: Load pickle files (fast - ~1 second)
5. If not: train_model() from scratch (slow - ~10-30 seconds)
6. Ready to serve requests
```

### Update Flow
```
Admin adds new product
    ↓
Backend approves product
    ↓
Backend calls POST /train
    ↓
ML-Service:
  1. Fetches all approved products from MongoDB (NEW)
  2. Processes and creates TF-IDF vectors
  3. Saves updated models to disk
  4. Ready with new data
    ↓
Next request uses updated model
```

## 7. Data Storage Locations

| Data | Location | Format | Size |
|------|----------|--------|------|
| **Products** | MongoDB | BSON docs | ~1-10MB |
| **Orders** | MongoDB | BSON docs | ~10-50MB |
| **ViewHistories** | MongoDB | BSON docs | ~5-20MB |
| **TF-IDF Vectorizer** | `/models/tfidf_vectorizer.pkl` | Pickle | ~2-5MB |
| **Product Vectors** | `/models/product_vectors.pkl` | Sparse matrix | ~5-20MB |
| **Products DataFrame** | `/models/products_df.pkl` | Pickle | ~3-10MB |

## 8. Performance Characteristics

| Operation | Time | Frequency |
|-----------|------|-----------|
| **Load model from disk** | ~1 second | Startup |
| **Train model from scratch** | ~10-30 seconds | First startup |
| **Find similar products** | ~50-100ms | Per request |
| **Get personalized recommendations** | ~200-500ms | Per request |
| **Get popular products** | ~100-200ms | Per request |

## Summary

The ML-Service provides an intelligent recommendation system by:

1. **Fetching approved products** from MongoDB
2. **Processing text features** (name, description, category, specs)
3. **Training TF-IDF model** to understand product relationships
4. **Computing similarity** between products using cosine similarity
5. **Serving three types of recommendations:**
   - Similar products (content-based)
   - Personalized recommendations (user history-based)
   - Popular products (sales-based)

All data flows through MongoDB → Processing → Model → API Endpoints → Frontend/Backend consumers.

