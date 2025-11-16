from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os
from pymongo import MongoClient
from bson import ObjectId
import logging

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all origins

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/ecommercedb')
client = MongoClient(MONGO_URI)
db = client['ecommercedb']

# Global variables for model
tfidf_vectorizer = None
product_vectors = None
products_df = None

def load_products_from_db():
    """Load products from MongoDB"""
    try:
        products = list(db.products.find({'status': 'approved'}))
        
        if not products:
            logger.warning("No products found in database")
            return pd.DataFrame()
        
        # Convert to DataFrame
        df = pd.DataFrame(products)
        df['_id'] = df['_id'].astype(str)
        
        # Extract keyFeatures as text
        df['keyFeatures_text'] = df['keyFeatures'].apply(
            lambda x: ' '.join(x) if isinstance(x, list) else ''
        )
        
        # Extract specifications as text
        df['specifications_text'] = df['specifications'].apply(
            lambda x: ' '.join(str(v) for v in x.values()) if isinstance(x, dict) else ''
        )
        
        # Create combined text feature for TF-IDF
        df['combined_features'] = (
            df['name'].fillna('') + ' ' +
            df['description'].fillna('') + ' ' +
            df['category'].fillna('') + ' ' +
            df['category'].fillna('') + ' ' +  # Boost category importance
            df['keyFeatures_text'].fillna('') + ' ' +
            df['specifications_text'].fillna('')
        )
        
        logger.info(f"Loaded {len(df)} products from database")
        return df
    except Exception as e:
        logger.error(f"Error loading products: {e}")
        return pd.DataFrame()

def train_model():
    """Train TF-IDF model and compute similarity matrix"""
    global tfidf_vectorizer, product_vectors, products_df
    
    try:
        # Load products
        products_df = load_products_from_db()
        
        if products_df.empty:
            logger.error("Cannot train model: No products available")
            return False
        
        # Initialize TF-IDF vectorizer
        tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),  # Use unigrams and bigrams
            min_df=1
        )
        
        # Fit and transform
        product_vectors = tfidf_vectorizer.fit_transform(products_df['combined_features'])
        
        logger.info(f"Model trained successfully with {product_vectors.shape[0]} products")
        
        # Save model
        save_model()
        
        return True
    except Exception as e:
        logger.error(f"Error training model: {e}")
        return False

def save_model():
    """Save trained model to disk"""
    try:
        os.makedirs('models', exist_ok=True)
        
        with open('models/tfidf_vectorizer.pkl', 'wb') as f:
            pickle.dump(tfidf_vectorizer, f)
        
        with open('models/product_vectors.pkl', 'wb') as f:
            pickle.dump(product_vectors, f)
        
        products_df.to_pickle('models/products_df.pkl')
        
        logger.info("Model saved successfully")
    except Exception as e:
        logger.error(f"Error saving model: {e}")

def load_model():
    """Load trained model from disk"""
    global tfidf_vectorizer, product_vectors, products_df
    
    try:
        if not all(os.path.exists(f'models/{f}') for f in ['tfidf_vectorizer.pkl', 'product_vectors.pkl', 'products_df.pkl']):
            logger.info("Model files not found, training new model...")
            return train_model()
        
        with open('models/tfidf_vectorizer.pkl', 'rb') as f:
            tfidf_vectorizer = pickle.load(f)
        
        with open('models/product_vectors.pkl', 'rb') as f:
            product_vectors = pickle.load(f)
        
        products_df = pd.read_pickle('models/products_df.pkl')
        
        logger.info(f"Model loaded successfully with {len(products_df)} products")
        return True
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        return False

def get_similar_products(product_id, top_n=10):
    """Find similar products using cosine similarity"""
    try:
        # Find product index
        product_idx = products_df[products_df['_id'] == product_id].index
        
        if len(product_idx) == 0:
            return []
        
        product_idx = product_idx[0]
        
        # Calculate cosine similarity
        similarities = cosine_similarity(product_vectors[product_idx], product_vectors).flatten()
        
        # Get top N similar products (excluding itself)
        similar_indices = similarities.argsort()[::-1][1:top_n+1]
        
        # Return product IDs and scores
        results = []
        for idx in similar_indices:
            results.append({
                'productId': products_df.iloc[idx]['_id'],
                'score': float(similarities[idx]),
                'name': products_df.iloc[idx]['name'],
                'category': products_df.iloc[idx]['category']
            })
        
        return results
    except Exception as e:
        logger.error(f"Error finding similar products: {e}")
        return []

def get_user_recommendations(customer_id, top_n=10):
    """Get personalized recommendations based on user history"""
    try:
        # Get user's purchase history
        orders = list(db.orders.find({
            'customer': ObjectId(customer_id),
            'paymentStatus': 'paid'
        }))
        
        purchased_product_ids = []
        for order in orders:
            for item in order.get('items', []):
                if 'product' in item:
                    purchased_product_ids.append(str(item['product']))
        
        # Get user's view history
        views = list(db.viewhistories.find({
            'customer': ObjectId(customer_id)
        }).sort('createdAt', -1).limit(20))
        
        viewed_product_ids = [str(v['product']) for v in views]
        
        # Combine and get unique IDs
        interacted_products = list(set(purchased_product_ids + viewed_product_ids))
        
        if not interacted_products:
            # No history - return popular products
            return get_popular_products(top_n)
        
        # Find similar products for each interacted product
        all_recommendations = {}
        
        for prod_id in interacted_products[:5]:  # Limit to last 5 interactions
            similar = get_similar_products(prod_id, top_n=20)
            
            for item in similar:
                pid = item['productId']
                score = item['score']
                
                # Boost score if purchased (vs just viewed)
                if prod_id in purchased_product_ids:
                    score *= 1.5
                
                # Accumulate scores
                if pid in all_recommendations:
                    all_recommendations[pid] += score
                else:
                    all_recommendations[pid] = score
        
        # Remove products user already interacted with
        for pid in interacted_products:
            all_recommendations.pop(pid, None)
        
        # Sort by score and return top N
        sorted_recs = sorted(all_recommendations.items(), key=lambda x: x[1], reverse=True)[:top_n]
        
        # Get full product details
        results = []
        for prod_id, score in sorted_recs:
            product_data = products_df[products_df['_id'] == prod_id]
            if not product_data.empty:
                results.append({
                    'productId': prod_id,
                    'score': float(score),
                    'name': product_data.iloc[0]['name'],
                    'category': product_data.iloc[0]['category']
                })
        
        return results
    except Exception as e:
        logger.error(f"Error getting user recommendations: {e}")
        return get_popular_products(top_n)

def get_popular_products(top_n=10):
    """Get popular products as fallback"""
    try:
        popular = list(db.products.find({
            'status': 'approved'
        }).sort('sold', -1).limit(top_n))
        
        return [{
            'productId': str(p['_id']),
            'score': float(p.get('sold', 0)),
            'name': p['name'],
            'category': p['category']
        } for p in popular]
    except Exception as e:
        logger.error(f"Error getting popular products: {e}")
        return []

# API Routes
@app.route('/')
def home():
    return jsonify({
        'service': 'E-commerce ML Recommendation Service',
        'status': 'running',
        'model_loaded': tfidf_vectorizer is not None,
        'products_count': len(products_df) if products_df is not None else 0
    })

@app.route('/train', methods=['POST'])
def train():
    """Retrain the model with latest data"""
    success = train_model()
    return jsonify({
        'success': success,
        'message': 'Model trained successfully' if success else 'Model training failed',
        'products_count': len(products_df) if products_df is not None else 0
    })

@app.route('/recommendations/similar/<product_id>', methods=['GET'])
def similar_products(product_id):
    """Get similar products"""
    top_n = request.args.get('limit', default=10, type=int)
    
    recommendations = get_similar_products(product_id, top_n)
    
    return jsonify({
        'success': True,
        'productId': product_id,
        'recommendations': recommendations,
        'count': len(recommendations)
    })

@app.route('/recommendations/user/<customer_id>', methods=['GET'])
def user_recommendations(customer_id):
    """Get personalized recommendations for user"""
    top_n = request.args.get('limit', default=10, type=int)
    
    recommendations = get_user_recommendations(customer_id, top_n)
    
    return jsonify({
        'success': True,
        'customerId': customer_id,
        'recommendations': recommendations,
        'count': len(recommendations)
    })

@app.route('/recommendations/popular', methods=['GET'])
def popular_products():
    """Get popular/trending products"""
    top_n = request.args.get('limit', default=10, type=int)
    
    products = get_popular_products(top_n)
    
    return jsonify({
        'success': True,
        'products': products,
        'count': len(products)
    })

# Initialize model on startup
logger.info("Starting ML Recommendation Service...")
load_model()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
