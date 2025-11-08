import express from "express";
import { signup, login, getSellerById } from "../controllers/sellerController.js";

const router = express.Router();

// Seller authentication routes
router.post("/signup", signup);
router.post("/login", login);

// Public routes
router.get("/:sellerId", getSellerById);

export default router;
