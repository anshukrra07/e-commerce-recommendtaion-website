import express from 'express';
import { createCheckout, verifyPayment } from '../controllers/checkoutController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/checkout/create - Create checkout session
router.post('/create', protect, createCheckout);

// POST /api/checkout/verify - Verify Razorpay payment
router.post('/verify', protect, verifyPayment);

export default router;
