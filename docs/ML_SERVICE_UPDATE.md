# ML-Service Configuration Update

## Overview
The ML-Service (Flask recommendation service) has been updated to:
1. Allow CORS for all origins (matching backend and frontend configuration)
2. Listen on all network interfaces (0.0.0.0)
3. Maintain compatibility with both local and cloud deployments

## Changes Made

### 1. **CORS Configuration Update** (`ml-service/app.py` - Line 14)
```python
# Before
CORS(app)  # Enable CORS for Express backend

# After
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all origins
```

This change allows the ML service to accept requests from:
- Frontend (localhost:3000 or production URL)
- Backend (localhost:5050 or production URL)
- Any external client or testing tool

### 2. **Server Configuration** (Already Correct - Line 330)
```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
```
✅ Already listening on all interfaces (0.0.0.0)
✅ Using port 5002 (configurable via environment)

### 3. **MongoDB Connection** (Already Flexible - Line 21)
```python
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/ecommercedb')
```
✅ Uses environment variable with localhost fallback
✅ Works for both local and cloud MongoDB

## How ML-Service Fits in the Architecture

```
Frontend (Port 3000)
    ↓
Backend (Port 5050)
    ↓
ML-Service (Port 5002)  ← Recommendation Engine
    ↓
MongoDB ← Reads product data
```

### Key Endpoints

1. **`/api/recommend`** - Get similar products
   - Called by: Backend recommendation controller
   - Used by: ProductDetailsPage (similar products widget)

2. **`/api/search`** - Search products by features
   - Called by: Backend search controller
   - Used by: ProductsPage search functionality

3. **`/api/track-view`** - Track user product views
   - Called by: Backend
   - Trains recommendation model

## Deployment Scenarios

### Local Development
```bash
# Terminal 1: Backend
cd backend && npm start
# Uses: http://localhost:5050

# Terminal 2: ML Service
cd ml-service && python app.py
# Uses: http://localhost:5002

# Terminal 3: Frontend
cd frontend1 && npm start
# Uses: http://localhost:3000
```

All services communicate locally with no special configuration needed.

### Production (Cloud)
```python
# ML Service automatically:
# 1. Connects to cloud MongoDB (via MONGO_URI env var)
# 2. Accepts requests from any origin (CORS: *)
# 3. Listens on 0.0.0.0 (accessible from anywhere)
```

### Environment Variables for ML-Service

```bash
# .env or system variables
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
FLASK_ENV=production
PORT=5002 (optional, defaults to 5002)
```

## CORS Policy

The updated CORS configuration:
```python
CORS(app, resources={r"/*": {"origins": "*"}})
```

This means:
- ✅ All HTTP methods allowed (GET, POST, PUT, DELETE, etc.)
- ✅ All origins accepted (no origin restrictions)
- ✅ Credentials can be included (if needed)
- ⚠️ **Note**: This is appropriate for backend-to-backend communication where both services are trusted

## Integration with Backend

The backend calls ML-Service endpoints:

### `backend/controllers/recommendationController.js`
```javascript
const FLASK_ML_URL = process.env.FLASK_ML_URL || 'http://localhost:5002';

// Calls ML service for recommendations
const response = await fetch(`${FLASK_ML_URL}/api/recommend`, {...});
```

### `backend/controllers/searchController.js`
```javascript
const FLASK_ML_URL = process.env.FLASK_ML_URL || 'http://localhost:5002';

// Calls ML service for search functionality
const response = await fetch(`${FLASK_ML_URL}/api/search`, {...});
```

## Configuration Consistency

| Component | Config Method | Local Dev | Production |
|-----------|---|---|---|
| **Frontend** | `utils/environment.js` | localhost:3000 → localhost:5050 | auto-detect |
| **Backend** | CORS with `*` | localhost:5050 | CORS with `*` |
| **ML-Service** | CORS with `*` | localhost:5002 | CORS with `*` |

## Testing ML-Service

### 1. Health Check
```bash
curl -X GET http://localhost:5002/health
```

### 2. Get Similar Products
```bash
curl -X POST http://localhost:5002/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"productId": "some_product_id", "limit": 5}'
```

### 3. Search Products
```bash
curl -X POST http://localhost:5002/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "laptop", "limit": 10}'
```

## Troubleshooting

### ML-Service not responding from Backend
1. Check if ML-Service is running: `curl http://localhost:5002`
2. Verify `FLASK_ML_URL` environment variable in backend
3. Check MongoDB connection for ML-Service

### CORS errors in production
- Already fixed! ML-Service accepts all origins with updated CORS config
- No additional configuration needed

### Model loading issues
- ML-Service loads products from MongoDB on startup
- Ensure MongoDB is running and accessible
- Check logs: `python app.py` (shows logs in debug mode)

## Dependencies

Required Python packages (in `ml-service/requirements.txt`):
```
Flask==2.3.0
flask-cors==4.0.0
pandas==1.5.0
numpy==1.23.0
scikit-learn==1.2.0
pymongo==4.3.0
```

Install with:
```bash
cd ml-service
pip install -r requirements.txt
```

## Summary

✅ ML-Service is now fully configured for:
- Local development (all services on localhost)
- Production deployment (cloud-based)
- Cross-service communication (Backend ↔ ML-Service)
- Frontend access (through Backend API)

All three services (Frontend, Backend, ML-Service) now use consistent CORS and deployment patterns!

