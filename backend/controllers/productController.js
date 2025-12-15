import Product from "../models/Product.js";
import Seller from "../models/Seller.js";
import fetch from "node-fetch";

// Helper function to trigger ML model retraining
const triggerMLRetrain = async () => {
  try {
    const flaskUrl = process.env.FLASK_ML_URL || 'http://localhost:10000';
    const response = await fetch(`${flaskUrl}/train`, { method: 'POST' });
    const data = await response.json();
    console.log('🤖 ML Model retrained:', data.products_count, 'products');
  } catch (error) {
    console.error('⚠️  ML retrain failed (non-critical):', error.message);
  }
};

// ===== SELLER PRODUCT CONTROLLERS =====

// @desc    Create a new product (Seller only)
// @route   POST /api/products/seller
// @access  Private (Seller)
export const createProduct = async (req, res) => {
  try {
    const { name, category, price, discount, stock, image, description, images, keyFeatures, specifications } = req.body;

    // Validate required fields
    if (!name || !category || !price || !stock || !image || !description) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide all required fields" 
      });
    }

    // Create product with seller reference
    const product = await Product.create({
      name,
      category,
      price,
      discount: discount || 0,
      stock,
      image,
      images: images || [],
      description,
      keyFeatures: keyFeatures || [],
      specifications: specifications || {},
      seller: req.user.id, // From auth middleware
      status: "pending" // All new products start as pending
    });

    // Trigger ML retrain in background (non-blocking)
    triggerMLRetrain();

    res.status(201).json({
      success: true,
      message: "Product submitted for admin approval",
      product
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Error creating product" 
    });
  }
};

// @desc    Get all products for logged-in seller
// @route   GET /api/products/seller
// @access  Private (Seller)
export const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .sort({ createdAt: -1 })
      .populate('seller', 'businessName email');

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error("Get seller products error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Error fetching products" 
    });
  }
};

// @desc    Update a product (Seller only - sets status back to pending)
// @route   PUT /api/products/seller/:id
// @access  Private (Seller)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, discount, stock, image, description, images, keyFeatures, specifications } = req.body;

    // Find product and verify ownership
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Check if product belongs to this seller
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to update this product" 
      });
    }

    // Update product and set status to pending for re-approval
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        category,
        price,
        discount: discount || 0,
        stock,
        image,
        images: images || [],
        description,
        keyFeatures: keyFeatures || [],
        specifications: specifications || {},
        status: "pending", // Requires re-approval after edit
        submittedDate: Date.now()
      },
      { new: true, runValidators: true }
    );

    // Trigger ML retrain in background (non-blocking)
    triggerMLRetrain();

    res.status(200).json({
      success: true,
      message: "Product updated and submitted for approval",
      product: updatedProduct
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Error updating product" 
    });
  }
};

// @desc    Delete a product (Seller only)
// @route   DELETE /api/products/seller/:id
// @access  Private (Seller)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product and verify ownership
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Check if product belongs to this seller
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to delete this product" 
      });
    }

    await Product.findByIdAndDelete(id);

    // Trigger ML retrain in background (non-blocking)
    triggerMLRetrain();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Error deleting product" 
    });
  }
};

// ===== ADMIN PRODUCT CONTROLLERS =====

// @desc    Get all pending products (Admin only)
// @route   GET /api/products/admin/pending
// @access  Private (Admin)
export const getPendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "pending" })
      .sort({ submittedDate: -1 })
      .populate('seller', 'businessName email ownerName phone');

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error("Get pending products error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Error fetching pending products" 
    });
  }
};

// @desc    Approve a product (Admin only)
// @route   PUT /api/products/admin/:id/approve
// @access  Private (Admin)
export const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    ).populate('seller', 'businessName email');

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Trigger ML retrain in background (non-blocking)
    triggerMLRetrain();

    res.status(200).json({
      success: true,
      message: "Product approved successfully",
      product
    });
  } catch (error) {
    console.error("Approve product error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Error approving product" 
    });
  }
};

// @desc    Reject a product (Admin only - deletes the product)
// @route   DELETE /api/products/admin/:id/reject
// @access  Private (Admin)
export const rejectProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Trigger ML retrain in background (non-blocking)
    triggerMLRetrain();

    res.status(200).json({
      success: true,
      message: "Product rejected and removed"
    });
  } catch (error) {
    console.error("Reject product error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Error rejecting product" 
    });
  }
};

// @desc    Get all approved products (Public)
// @route   GET /api/products
// @access  Public
export const getAllApprovedProducts = async (req, res) => {
  try {
    // Build query filter
    const filter = { status: "approved" };
    
    // Add seller filter if provided
    if (req.query.seller) {
      filter.seller = req.query.seller;
    }
    
    // Add category filter if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter)
      .populate('seller', 'businessName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
      products // Keep for backward compatibility
    });
  } catch (error) {
    console.error("Get approved products error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Error fetching products" 
    });
  }
};

// @desc    Get single product by ID (Public)
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('seller', 'businessName email phone');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Only return approved products to public
    if (product.status !== "approved") {
      return res.status(404).json({
        success: false,
        message: "Product not available"
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching product"
    });
  }
};
