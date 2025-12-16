#!/bin/bash

# Test Auto-Retrain Feature
# This script creates a test product and monitors the automatic ML retraining

echo "🧪 Testing Automatic ML Retraining"
echo "===================================="
echo ""

# Check Flask status before test
echo "📊 Current ML Model Status:"
curl -s http://localhost:5002/ | python3 -m json.tool
echo ""

# Get seller token (you need to replace this with actual seller token)
echo "⚠️  You need a seller token to run this test!"
echo ""
echo "To get seller token:"
echo "1. Login as seller in the frontend"
echo "2. Open browser console"
echo "3. Run: localStorage.getItem('authToken')"
echo "4. Copy the token"
echo ""
echo "Then run:"
echo "  SELLER_TOKEN='your_token_here' ./test-auto-retrain.sh"
echo ""

if [ -z "$SELLER_TOKEN" ]; then
    echo "❌ SELLER_TOKEN not set. Exiting..."
    exit 1
fi

echo "✅ Seller token found!"
echo ""

# Create test product
echo "📦 Creating test product..."
RESPONSE=$(curl -s -X POST http://localhost:5050/api/products/seller \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Auto-Retrain Test Product",
    "category": "Electronics",
    "price": 99.99,
    "stock": 50,
    "image": "🧪",
    "description": "This product tests automatic ML retraining"
  }')

echo "$RESPONSE" | python3 -m json.tool
echo ""

# Wait for retrain to complete
echo "⏳ Waiting 3 seconds for retraining..."
sleep 3

# Check Flask status after test
echo ""
echo "📊 ML Model Status After Product Creation:"
curl -s http://localhost:5002/ | python3 -m json.tool
echo ""

echo "✅ Test Complete!"
echo ""
echo "Expected Results:"
echo "  - Backend console should show: '🤖 ML Model retrained: X products'"
echo "  - Product count should have increased by 1"
echo ""
echo "Check backend logs:"
echo "  tail -20 /tmp/backend.log"
