import fetch from 'node-fetch';
import ViewHistory from '../models/ViewHistory.js';
import Product from '../models/Product.js';

const FLASK_ML_URL = process.env.FLASK_ML_URL || 'http://localhost:5002';

// Cache for recommendations (1 hour)
const recommendationCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// @desc    Get personalized recommendations for a customer
// @route   GET /api/recommendations/:customerId
// @access  Public
export const getPersonalizedRecommendations = async (req, res) => {
  try {
    const { customerId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // Check cache
    const cacheKey = `user_${customerId}_${limit}`;
    const cached = recommendationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        source: 'cache',
        products: cached.data
      });
    }

    // Call Flask ML service
    const mlResponse = await fetch(
      `${FLASK_ML_URL}/recommendations/user/${customerId}?limit=${limit}`,
      { timeout: 5000 }
    );

    if (!mlResponse.ok) {
      throw new Error('ML service unavailable');
    }

    const mlData = await mlResponse.json();

    if (!mlData.success || !mlData.recommendations) {
      throw new Error('Invalid ML response');
    }

    // Get full product details from MongoDB
    const productIds = mlData.recommendations.map(r => r.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      status: 'approved'
    })
      .populate('seller', 'businessName email')
      .select('-__v');

    // Add ML scores to products
    const productsWithScores = products.map(product => {
      const mlRec = mlData.recommendations.find(r => r.productId === product._id.toString());
      return {
        ...product.toObject(),
        mlScore: mlRec?.score || 0
      };
    });

    // Sort by ML score
    productsWithScores.sort((a, b) => b.mlScore - a.mlScore);

    // Cache the results
    recommendationCache.set(cacheKey, {
      data: productsWithScores,
      timestamp: Date.now()
    });

    res.status(200).json({
      success: true,
      source: 'ml',
      products: productsWithScores,
      count: productsWithScores.length
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    
    // Fallback: Return popular products
    try {
      const popularProducts = await Product.find({ status: 'approved' })
        .sort({ sold: -1 })
        .limit(10)
        .populate('seller', 'businessName email')
        .select('-__v');

      res.status(200).json({
        success: true,
        source: 'fallback',
        products: popularProducts,
        count: popularProducts.length,
        message: 'Showing popular products (ML service unavailable)'
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Failed to get recommendations'
      });
    }
  }
};

// @desc    Get similar products
// @route   GET /api/recommendations/similar/:productId
// @access  Public
export const getSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // Check cache
    const cacheKey = `similar_${productId}_${limit}`;
    const cached = recommendationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        source: 'cache',
        products: cached.data
      });
    }

    // Call Flask ML service
    const mlResponse = await fetch(
      `${FLASK_ML_URL}/recommendations/similar/${productId}?limit=${limit}`,
      { timeout: 5000 }
    );

    if (!mlResponse.ok) {
      throw new Error('ML service unavailable');
    }

    const mlData = await mlResponse.json();

    if (!mlData.success || !mlData.recommendations) {
      throw new Error('Invalid ML response');
    }

    // Get full product details
    const productIds = mlData.recommendations.map(r => r.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      status: 'approved'
    })
      .populate('seller', 'businessName email')
      .select('-__v');

    // Add similarity scores
    const productsWithScores = products.map(product => {
      const mlRec = mlData.recommendations.find(r => r.productId === product._id.toString());
      return {
        ...product.toObject(),
        similarityScore: mlRec?.score || 0
      };
    });

    // Sort by similarity score
    productsWithScores.sort((a, b) => b.similarityScore - a.similarityScore);

    // Cache the results
    recommendationCache.set(cacheKey, {
      data: productsWithScores,
      timestamp: Date.now()
    });

    res.status(200).json({
      success: true,
      source: 'ml',
      products: productsWithScores,
      count: productsWithScores.length
    });

  } catch (error) {
    console.error('Similar products error:', error);
    
    // Fallback: Return products from same category
    try {
      const product = await Product.findById(req.params.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const similarProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
        status: 'approved'
      })
        .limit(10)
        .populate('seller', 'businessName email')
        .select('-__v');

      res.status(200).json({
        success: true,
        source: 'fallback',
        products: similarProducts,
        count: similarProducts.length,
        message: 'Showing similar category products'
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Failed to get similar products'
      });
    }
  }
};

// @desc    Track product view
// @route   POST /api/recommendations/track-view
// @access  Private (Customer)
export const trackProductView = async (req, res) => {
  try {
    const { productId, duration } = req.body;
    const customerId = req.user._id;

    // Get product details
    const product = await Product.findById(productId).select('category');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Save view history
    await ViewHistory.create({
      customer: customerId,
      product: productId,
      category: product.category,
      duration: duration || 0
    });

    // Clear cache for this user
    const cacheKeys = Array.from(recommendationCache.keys());
    cacheKeys.forEach(key => {
      if (key.startsWith(`user_${customerId}`)) {
        recommendationCache.delete(key);
      }
    });

    res.status(200).json({
      success: true,
      message: 'View tracked successfully'
    });

  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track view'
    });
  }
};

// @desc    Get popular/trending products
// @route   GET /api/recommendations/popular
// @access  Public
export const getPopularProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Check cache
    const cacheKey = `popular_${limit}`;
    const cached = recommendationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        source: 'cache',
        products: cached.data
      });
    }

    // Get popular products (by sales)
    const products = await Product.find({ status: 'approved' })
      .sort({ sold: -1, rating: -1 })
      .limit(limit)
      .select('-__v');

    // Cache the results
    recommendationCache.set(cacheKey, {
      data: products,
      timestamp: Date.now()
    });

    res.status(200).json({
      success: true,
      products,
      count: products.length
    });

  } catch (error) {
    console.error('Popular products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular products'
    });
  }
};

// @desc    Retrain ML model
// @route   POST /api/recommendations/retrain
// @access  Private (Admin)
export const retrainModel = async (req, res) => {
  try {
    const mlResponse = await fetch(`${FLASK_ML_URL}/train`, {
      method: 'POST',
      timeout: 30000 // 30 seconds for training
    });

    const mlData = await mlResponse.json();

    // Clear all caches
    recommendationCache.clear();

    res.status(200).json({
      success: mlData.success,
      message: mlData.message,
      products_count: mlData.products_count
    });

  } catch (error) {
    console.error('Retrain model error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrain model'
    });
  }
};
