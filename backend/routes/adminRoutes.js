import express from "express";
import { 
  login, 
  getPendingSellers, 
  approveSeller, 
  rejectSeller,
  getAllCustomers,
  getAllSellers,
  getAdminAnalytics
} from "../controllers/adminController.js";
import { protect } from "../middleware/auth.js";
import { isAdmin } from "../middleware/roleAuth.js";

const router = express.Router();

// Admin authentication route (public)
router.post("/login", login);

// Seller management routes (protected - admin only)
router.get("/sellers/pending", protect, isAdmin, getPendingSellers);
router.put("/sellers/:id/approve", protect, isAdmin, approveSeller);
router.delete("/sellers/:id/reject", protect, isAdmin, rejectSeller);

// Account management routes (protected - admin only)
router.get("/customers", protect, isAdmin, getAllCustomers);
router.get("/sellers", protect, isAdmin, getAllSellers);

// Analytics route (protected - admin only)
router.get("/analytics", protect, isAdmin, getAdminAnalytics);

export default router;
