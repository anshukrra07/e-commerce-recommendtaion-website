import express from "express";
import { 
  sendMessage, 
  getConversation, 
  getSellerChats,
  markAsRead,
  deleteConversation,
  cleanupSellerChats
} from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.post("/send", protect, sendMessage);
router.get("/conversation/:productId/:otherUserId", protect, getConversation);
router.get("/seller/chats", protect, getSellerChats);
router.put("/mark-read", protect, markAsRead);
router.delete("/conversation", protect, deleteConversation);
router.delete("/seller/cleanup", protect, cleanupSellerChats);

export default router;
