# 🤖 Automatic ML Model Retraining

## Overview

The ML recommendation model **automatically retrains** whenever product data changes, ensuring recommendations are always up-to-date with the latest products.

---

## ⚡ When Auto-Retrain Triggers

### ✅ **Automatically Retrains On:**

1. **New Product Created** (Seller creates product)
   - Endpoint: `POST /api/products/seller`
   - Status: `pending`

2. **Product Updated** (Seller edits product)
   - Endpoint: `PUT /api/products/seller/:id`
   - Status: Reset to `pending`

3. **Product Approved** (Admin approves)
   - Endpoint: `PUT /api/products/admin/:id/approve`
   - Status: `approved` → Now visible to customers

4. **Product Deleted** (Seller/Admin deletes)
   - Endpoint: `DELETE /api/products/seller/:id`
   - Endpoint: `DELETE /api/products/admin/:id/reject`

---

## 🔧 How It Works

### **Implementation**

**File:** `/backend/controllers/productController.js`

```javascript
import fetch from "node-fetch";

// Helper function to trigger ML model retraining
const triggerMLRetrain = async () => {
  try {
    const flaskUrl = process.env.FLASK_ML_URL || 'http://localhost:5002';
    const response = await fetch(`${flaskUrl}/train`, { method: 'POST' });
    const data = await response.json();
    console.log('🤖 ML Model retrained:', data.products_count, 'products');
  } catch (error) {
    console.error('⚠️  ML retrain failed (non-critical):', error.message);
  }
};
```

### **Non-Blocking Design**

- Retraining happens **asynchronously** in the background
- API response returns **immediately** to the user
- Zero performance impact on product operations
- If Flask is down, error is logged but product operation succeeds

---

## 📊 Monitoring Auto-Retrain

### **Backend Console Logs**

When retraining happens, you'll see:

```bash
🤖 ML Model retrained: 58 products
```

If Flask is unavailable:

```bash
⚠️  ML retrain failed (non-critical): connect ECONNREFUSED 127.0.0.1:5002
```

### **Flask Console Logs**

When retrain is triggered:

```bash
INFO:werkzeug:127.0.0.1 - - [DATE] "POST /train HTTP/1.1" 200 -
Model trained successfully! Products: 58
```

---

## 🧪 Testing Auto-Retrain

### **Test 1: Create Product**

```bash
# Login as seller (get token)
SELLER_TOKEN="your_seller_token"

# Create product
curl -X POST http://localhost:5050/api/products/seller \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "category": "Electronics",
    "price": 99,
    "stock": 10,
    "image": "📱",
    "description": "Test product for auto-retrain"
  }'
```

**Expected Backend Console:**
```
🤖 ML Model retrained: 59 products
```

---

### **Test 2: Update Product**

```bash
# Update product
curl -X PUT http://localhost:5050/api/products/seller/PRODUCT_ID \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product Name",
    "category": "Electronics",
    "price": 89,
    "stock": 15,
    "image": "📱",
    "description": "Updated description"
  }'
```

**Expected Backend Console:**
```
🤖 ML Model retrained: 59 products
```

---

### **Test 3: Admin Approve**

```bash
# Login as admin (get token)
ADMIN_TOKEN="your_admin_token"

# Approve product
curl -X PUT http://localhost:5050/api/products/admin/PRODUCT_ID/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Backend Console:**
```
🤖 ML Model retrained: 59 products
```

---

### **Test 4: Delete Product**

```bash
# Delete product
curl -X DELETE http://localhost:5050/api/products/seller/PRODUCT_ID \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

**Expected Backend Console:**
```
🤖 ML Model retrained: 58 products
```

---

## 🎯 Benefits

### ✅ **Always Up-to-Date**
- New products appear in recommendations immediately
- No manual retraining needed
- No cron jobs required

### ✅ **Zero Maintenance**
- Fully automatic
- No admin intervention
- Works 24/7

### ✅ **Performance**
- Non-blocking async calls
- No API slowdown
- ~2 seconds retrain time

### ✅ **Resilient**
- Continues working if Flask is down
- Errors logged but don't break product operations
- Graceful degradation

---

## ⚙️ Configuration

### **Flask URL**

Default: `http://localhost:5002`

To change, add to `/backend/.env`:

```env
FLASK_ML_URL=http://localhost:5002
```

For production:
```env
FLASK_ML_URL=https://ml-service.yoursite.com
```

---

## 🔍 Troubleshooting

### **Problem: No retrain logs appearing**

**Check 1:** Is Flask ML service running?
```bash
curl http://localhost:5002/
```

**Check 2:** Is backend running?
```bash
curl http://localhost:5050/api/products
```

**Check 3:** Check backend logs
```bash
tail -f /tmp/backend.log
```

---

### **Problem: Retrain taking too long**

**Cause:** Large product database

**Solution:** This is normal! Flask trains in background:
- 100 products: ~1-2 seconds
- 1000 products: ~5-10 seconds
- 10,000 products: ~30-60 seconds

User doesn't wait - API returns immediately!

---

### **Problem: Retrain fails with ECONNREFUSED**

**Cause:** Flask not running on port 5002

**Solution:**
```bash
cd /Users/anshu/Downloads/e-com/ml-service
python3 app.py
```

**Note:** Product operations still work! Retraining just skipped.

---

## 📈 Production Considerations

### **Option 1: Keep Auto-Retrain (Recommended)**

✅ **Best for:**
- Frequent product updates
- Real-time recommendations
- Small to medium catalogs (<10,000 products)

### **Option 2: Add Debouncing**

If you have **many rapid updates**, add debouncing:

```javascript
// In productController.js
let retrainTimeout;

const triggerMLRetrain = async () => {
  // Cancel previous retrain request
  if (retrainTimeout) clearTimeout(retrainTimeout);
  
  // Wait 30 seconds before retraining
  retrainTimeout = setTimeout(async () => {
    try {
      const flaskUrl = process.env.FLASK_ML_URL || 'http://localhost:5002';
      const response = await fetch(`${flaskUrl}/train`, { method: 'POST' });
      const data = await response.json();
      console.log('🤖 ML Model retrained:', data.products_count, 'products');
    } catch (error) {
      console.error('⚠️  ML retrain failed (non-critical):', error.message);
    }
  }, 30000); // 30 seconds
};
```

This batches multiple updates into a single retrain.

### **Option 3: Queue-Based (For Very Large Catalogs)**

For **>10,000 products**, consider:
- Redis queue (Bull/BullMQ)
- Job scheduling
- Rate limiting

---

## 🎉 Summary

✅ **Auto-retrain is enabled** on all product operations  
✅ **Zero configuration** needed  
✅ **Non-blocking** - doesn't slow down API  
✅ **Resilient** - works even if Flask is down  
✅ **Real-time** - recommendations always current  

Your ML model stays fresh automatically! 🚀
