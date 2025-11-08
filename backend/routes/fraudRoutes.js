import express from 'express';
import {
  createFraudReport,
  getAllFraudReports,
  getFraudReportById,
  updateFraudReportStatus,
  resolveFraudReport,
  dismissFraudReport,
  getFraudStats
} from '../controllers/fraudController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Public/User routes
router.post('/report', protect, createFraudReport);

// Admin routes
router.get('/reports', protect, isAdmin, getAllFraudReports);
router.get('/reports/:id', protect, isAdmin, getFraudReportById);
router.put('/reports/:id/status', protect, isAdmin, updateFraudReportStatus);
router.put('/reports/:id/resolve', protect, isAdmin, resolveFraudReport);
router.delete('/reports/:id', protect, isAdmin, dismissFraudReport);
router.get('/stats', protect, isAdmin, getFraudStats);

export default router;
