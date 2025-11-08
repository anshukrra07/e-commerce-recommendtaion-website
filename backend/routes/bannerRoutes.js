import express from 'express';
import {
  createBanner,
  getAllBanners,
  getActiveBanners,
  getBannerById,
  updateBanner,
  toggleBannerStatus,
  deleteBanner,
  trackBannerImpression,
  trackBannerClick
} from '../controllers/bannerController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roleAuth.js';
import { uploadBannerImage } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/active', getActiveBanners);
router.post('/:id/impression', trackBannerImpression);
router.post('/:id/click', trackBannerClick);

// Admin routes
router.post('/upload-image', protect, isAdmin, uploadBannerImage.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded'
      });
    }

    // Return Cloudinary URL of uploaded image
    res.status(200).json({
      success: true,
      message: 'Banner image uploaded successfully to Cloudinary',
      imageUrl: req.file.path // Cloudinary URL
    });
  } catch (error) {
    console.error('Banner image upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading banner image'
    });
  }
});

router.post('/', protect, isAdmin, createBanner);
router.get('/', getAllBanners);
router.get('/:id', protect, isAdmin, getBannerById);
router.put('/:id', protect, isAdmin, updateBanner);
router.put('/:id/toggle', protect, isAdmin, toggleBannerStatus);
router.delete('/:id', protect, isAdmin, deleteBanner);

export default router;
