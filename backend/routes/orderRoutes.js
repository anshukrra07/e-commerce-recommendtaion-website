import express from 'express';
import { getOrderById, getCustomerOrders, updateOrderStatus, cancelOrder, getSellerOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/orders/:id - Get order by ID
router.get('/:id', protect, getOrderById);

// GET /api/orders - Get all orders for logged-in customer
router.get('/', protect, getCustomerOrders);

// GET /api/orders/seller - Get orders for seller's products
router.get('/seller/orders', protect, getSellerOrders);

// PUT /api/orders/:id/status - Update order status (Admin/Seller)
router.put('/:id/status', protect, updateOrderStatus);

// POST /api/orders/:id/cancel - Cancel order
router.post('/:id/cancel', protect, cancelOrder);

export default router;
