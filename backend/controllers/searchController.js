import Product from '../models/Product.js';
import fetch from 'node-fetch';

const FLASK_ML_URL = process.env.FLASK_ML_URL || 'http://localhost:5002';

// @desc    Search products with ML-based similar suggestions
// @route   GET /api/search?q=query
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchQuery = q.trim();

    // Search in product name, description, category, keyFeatures
    const searchRegex = new RegExp(searchQuery, 'i');
    
    const products = await Product.find({
      status: 'approved',
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { keyFeatures: { $elemMatch: { $regex: searchRegex } } }
      ]
    })
      .populate('seller', 'businessName email')
      .limit(20)
      .select('-__v');

    // If we found exact matches, get similar products for the first result
    let similarProducts = [];
    if (products.length > 0) {
      try {
        const firstProductId = products[0]._id;
        const mlResponse = await fetch(
          `${FLASK_ML_URL}/recommendations/similar/${firstProductId}?limit=5`,
          { timeout: 3000 }
        );

        if (mlResponse.ok) {
          const mlData = await mlResponse.json();
          if (mlData.success && mlData.recommendations) {
            const similarIds = mlData.recommendations.map(r => r.productId);
            const similar = await Product.find({
              _id: { $in: similarIds },
              status: 'approved'
            })
              .populate('seller', 'businessName email')
              .select('-__v');

            similarProducts = similar;
          }
        }
      } catch (mlError) {
        console.log('ML similar products unavailable:', mlError.message);
      }
    }

    res.status(200).json({
      success: true,
      query: searchQuery,
      results: products,
      similar: similarProducts,
      count: products.length
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
};
