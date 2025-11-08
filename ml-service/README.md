# 🤖 E-Commerce ML Recommendation Service

Flask-based machine learning service for personalized product recommendations using TF-IDF and cosine similarity.

## 🎯 Features

- **Content-Based Filtering**: Uses TF-IDF on product names, descriptions, and categories
- **Cosine Similarity**: Finds similar products based on text features
- **Personalized Recommendations**: Based on purchase and view history
- **Real-time Updates**: Can retrain model with new products
- **Fallback Logic**: Shows popular products for new users

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Start the Service

```bash
python app.py
```

Service will run on `http://localhost:5001`

### 3. Train Initial Model

```bash
curl -X POST http://localhost:5001/train
```

---

## 📡 API Endpoints

### 1. Get Service Status
```bash
GET /
```

Response:
```json
{
  "service": "E-commerce ML Recommendation Service",
  "status": "running",
  "model_loaded": true,
  "products_count": 25
}
```

### 2. Get Similar Products
```bash
GET /recommendations/similar/{product_id}?limit=10
```

Example:
```bash
curl http://localhost:5001/recommendations/similar/690d7c04598ed1ebcbdce404?limit=5
```

Response:
```json
{
  "success": true,
  "productId": "690d7c04598ed1ebcbdce404",
  "recommendations": [
    {
      "productId": "690e123...",
      "score": 0.85,
      "name": "Similar Product Name",
      "category": "electronics"
    }
  ],
  "count": 5
}
```

### 3. Get Personalized Recommendations
```bash
GET /recommendations/user/{customer_id}?limit=10
```

Example:
```bash
curl http://localhost:5001/recommendations/user/690cf9c59ce8969e8d504246?limit=10
```

Response:
```json
{
  "success": true,
  "customerId": "690cf9c59ce8969e8d504246",
  "recommendations": [
    {
      "productId": "690e456...",
      "score": 2.45,
      "name": "Recommended Product",
      "category": "electronics"
    }
  ],
  "count": 10
}
```

### 4. Get Popular Products
```bash
GET /recommendations/popular?limit=10
```

### 5. Retrain Model
```bash
POST /train
```

---

## 🧠 How It Works

### Algorithm Flow

1. **Data Collection**
   - Loads approved products from MongoDB
   - Combines: name + description + category into text features

2. **TF-IDF Vectorization**
   - Converts text to numerical vectors
   - Uses unigrams and bigrams
   - Max 1000 features

3. **Similarity Calculation**
   - Computes cosine similarity between product vectors
   - Similarity score: 0 (different) to 1 (identical)

4. **Personalization**
   - Finds products similar to what user bought/viewed
   - Boosts score for purchased items (1.5x weight)
   - Combines scores from multiple interactions
   - Excludes already-viewed products

5. **Ranking**
   - Sorts by relevance score
   - Returns top N recommendations

---

## 📊 Model Details

### TF-IDF Parameters
- **max_features**: 1000
- **ngram_range**: (1, 2) - unigrams and bigrams
- **stop_words**: English
- **min_df**: 1

### Similarity Metric
- **Cosine Similarity**: Measures angle between vectors
- Range: 0 (orthogonal) to 1 (identical)

### Scoring Weights
- **Purchased products**: 1.5x multiplier
- **Viewed products**: 1.0x multiplier
- Scores accumulate across multiple interactions

---

## 🔄 Workflow Integration

### Express Backend Integration

```javascript
// Call Flask ML service
const getRecommendations = async (customerId) => {
  try {
    const response = await fetch(
      `http://localhost:5001/recommendations/user/${customerId}?limit=10`
    );
    const data = await response.json();
    return data.recommendations;
  } catch (error) {
    console.error('ML service error:', error);
    return getFallbackRecommendations();
  }
};
```

### Frontend Integration

```javascript
// Display recommendations
useEffect(() => {
  if (isLoggedIn && userId) {
    fetch(`http://localhost:5050/api/recommendations/${userId}`)
      .then(res => res.json())
      .then(data => setRecommendations(data.products));
  }
}, [isLoggedIn, userId]);
```

---

## 🗂️ Model Files

Models are saved in `ml-service/models/`:
- `tfidf_vectorizer.pkl` - TF-IDF model
- `product_vectors.pkl` - Product similarity matrix
- `products_df.pkl` - Product DataFrame

---

## 🔧 Maintenance

### Retrain Model
Retrain when:
- New products added
- Product descriptions updated
- Weekly/monthly schedule

```bash
curl -X POST http://localhost:5001/train
```

### Monitor Performance
- Check logs for errors
- Monitor recommendation quality
- Track click-through rate

---

## 🚨 Troubleshooting

### "No products found"
- Ensure MongoDB is running
- Check products collection has approved products
- Verify MONGO_URI environment variable

### "Model training failed"
- Check product data has name, description, category
- Ensure at least 2 products exist
- Check Python dependencies installed

### Flask service not starting
- Verify port 5001 is available
- Check Python version (3.8+)
- Install all requirements

---

## 📈 Performance

- **Training time**: ~1-2 seconds for 100 products
- **Prediction time**: ~10-50ms per request
- **Memory usage**: ~50-200MB depending on product count
- **Scalability**: Handles 1000+ products efficiently

---

## 🛠️ Development

### Run in Development Mode
```bash
python app.py
```

### Run in Production
```bash
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

---

## 📝 Next Steps

1. ✅ Start Flask service
2. ✅ Train model with existing products
3. ✅ Integrate with Express backend
4. ✅ Add view tracking to frontend
5. ✅ Display recommendations on homepage
6. 🔄 Monitor and retrain regularly

---

## 🤝 Support

For issues or questions:
- Check logs: `tail -f ml-service/logs/*.log`
- Test API: `curl http://localhost:5001/`
- Verify MongoDB connection
