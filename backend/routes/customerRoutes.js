import express from "express";
import { signup, login } from "../controllers/customerController.js";

const router = express.Router();

// Customer authentication routes
router.post("/signup", signup);
router.post("/login", login);

export default router;
