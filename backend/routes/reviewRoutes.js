import express from "express";
import { 
  addReview, 
  getProductReviews, 
  getSellerReviews,
  updateReview, 
  deleteReview,
  getMyReviewForProduct 
} from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);
router.get("/seller/:sellerId", getSellerReviews);

// Protected routes (Customer only)
router.post("/", protect, addReview);
router.put("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);
router.get("/product/:productId/my-review", protect, getMyReviewForProduct);

export default router;
