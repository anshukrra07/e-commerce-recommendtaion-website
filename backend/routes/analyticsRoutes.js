import express from "express";
import { getSellerAnalytics, getAdminAnalytics } from "../controllers/analyticsController.js";
import { protect } from "../middleware/auth.js";
import { isSeller, isAdmin } from "../middleware/roleAuth.js";

const router = express.Router();

// ===== SELLER ANALYTICS ROUTE =====
router.get("/seller", protect, isSeller, getSellerAnalytics);

// ===== ADMIN ANALYTICS ROUTE =====
router.get("/admin", protect, isAdmin, getAdminAnalytics);

export default router;
