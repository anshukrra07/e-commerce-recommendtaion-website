import express from "express";
import {
  createProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getAllApprovedProducts,
  getProductById
} from "../controllers/productController.js";
import { protect } from "../middleware/auth.js";
import { isSeller, isAdmin } from "../middleware/roleAuth.js";
import { uploadProductImages } from "../config/cloudinary.js";

const router = express.Router();

// ===== IMAGE UPLOAD ROUTE =====
// Must come before /:id to avoid matching "upload-images" as an ID
router.post("/upload-images", protect, isSeller, uploadProductImages.array('images', 6), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    // Return Cloudinary URLs of uploaded images
    const imageUrls = req.files.map(file => file.path); // Cloudinary URL is in file.path
    
    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully to Cloudinary',
      imageUrls
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading images'
    });
  }
});

// ===== SELLER ROUTES =====
// Must come before /:id to avoid matching "seller" as an ID
router.post("/seller", protect, isSeller, createProduct); // Create product
router.get("/seller", protect, isSeller, getSellerProducts); // Get seller's products
router.put("/seller/:id", protect, isSeller, updateProduct); // Update product
router.delete("/seller/:id", protect, isSeller, deleteProduct); // Delete product

// ===== ADMIN ROUTES =====
// Must come before /:id to avoid matching "admin" as an ID
router.get("/admin/pending", protect, isAdmin, getPendingProducts); // Get pending products
router.put("/admin/:id/approve", protect, isAdmin, approveProduct); // Approve product
router.delete("/admin/:id/reject", protect, isAdmin, rejectProduct); // Reject product

// ===== PUBLIC ROUTES =====
router.get("/", getAllApprovedProducts); // Get all approved products
router.get("/:id", getProductById); // Get single product by ID (MUST BE LAST)

export default router;
