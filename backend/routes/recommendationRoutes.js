import express from 'express';
import {
  getPersonalizedRecommendations,
  getSimilarProducts,
  trackProductView,
  getPopularProducts,
  retrainModel
} from '../controllers/recommendationController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Public routes
router.get('/popular', getPopularProducts);
router.get('/similar/:productId', getSimilarProducts);
router.get('/:customerId', getPersonalizedRecommendations);

// Protected routes (Customer)
router.post('/track-view', protect, trackProductView);

// Admin routes
router.post('/retrain', protect, isAdmin, retrainModel);

export default router;
