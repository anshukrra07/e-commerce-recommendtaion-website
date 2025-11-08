import express from "express";
import { chatWithBot } from "../controllers/chatbotController.js";

const router = express.Router();

// @route   POST /api/chatbot
// @desc    Chat with AI assistant
// @access  Public (no auth required)
router.post("/", chatWithBot);

export default router;
