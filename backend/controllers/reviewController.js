import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

// @desc    Add a review for a product
// @route   POST /api/reviews
// @access  Private (Customer only)
export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const customerId = req.user.id;

    // Validate input
    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Please provide product ID, rating, and comment"
      });
    }

    // Check if product exists and is approved
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (product.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Cannot review a product that is not approved"
      });
    }

    // Create review (allow multiple reviews per product)
    const review = await Review.create({
      product: productId,
      customer: customerId,
      rating,
      comment
    });

    // Populate customer and product data
    await review.populate([{ path: 'customer', select: 'name email' }, { path: 'product', select: 'name image' }]);

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review
    });

  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: error.message
    });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Get reviews with customer and product info
    const reviews = await Review.find({ product: productId })
      .populate('customer', 'name email')
      .populate('product', 'name image')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        totalReviews: reviews.length,
        averageRating: parseFloat(averageRating)
      }
    });

  } catch (error) {
    console.error("Error fetching product reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private (Customer only - own review)
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const customerId = req.user.id;

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Check if customer owns this review
    if (review.customer.toString() !== customerId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own reviews"
      });
    }

    // Update review
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    await review.save();

    await review.populate('customer', 'name email');

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review
    });

  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: error.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private (Customer only - own review)
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const customerId = req.user.id;

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Check if customer owns this review
    if (review.customer.toString() !== customerId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews"
      });
    }

    // Delete review
    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message
    });
  }
};

// @desc    Get customer's review for a product
// @route   GET /api/reviews/product/:productId/my-review
// @access  Private (Customer only)
export const getMyReviewForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const customerId = req.user.id;

    const review = await Review.findOne({
      product: productId,
      customer: customerId
    }).populate([{ path: 'customer', select: 'name email' }, { path: 'product', select: 'name image' }]);

    res.status(200).json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error("Error fetching customer review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch review",
      error: error.message
    });
  }
};

// @desc    Get all reviews for a seller's products
// @route   GET /api/reviews/seller/:sellerId
// @access  Public
export const getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Get all products for this seller
    const products = await Product.find({ seller: sellerId, status: 'approved' }).select('_id');
    const productIds = products.map(p => p._id);

    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          reviews: [],
          totalReviews: 0,
          averageRating: 0
        }
      });
    }

    // Get reviews for all these products
    const reviews = await Review.find({ product: { $in: productIds } })
      .populate('customer', 'name email')
      .populate('product', 'name image')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        totalReviews: reviews.length,
        averageRating: parseFloat(averageRating)
      }
    });

  } catch (error) {
    console.error("Error fetching seller reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message
    });
  }
};
