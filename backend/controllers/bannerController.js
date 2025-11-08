import Banner from '../models/Banner.js';

// @desc    Create a new banner
// @route   POST /api/banners
// @access  Private (Admin)
export const createBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      image,
      backgroundColor,
      backgroundColorEnd,
      textColor,
      buttonText,
      buttonLink,
      position,
      priority,
      startDate,
      endDate,
      status
    } = req.body;

    const banner = await Banner.create({
      title,
      subtitle,
      image,
      backgroundColor,
      backgroundColorEnd,
      textColor,
      buttonText,
      buttonLink,
      position,
      priority,
      startDate,
      endDate,
      status,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner
    });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create banner'
    });
  }
};

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
export const getAllBanners = async (req, res) => {
  try {
    const { status, position } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (position) filter.position = position;

    const banners = await Banner.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch banners'
    });
  }
};

// @desc    Get active banners for homepage
// @route   GET /api/banners/active
// @access  Public
export const getActiveBanners = async (req, res) => {
  try {
    const { position } = req.query;
    
    const now = new Date();
    
    const filter = {
      status: 'active',
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: { $gte: now } }
      ]
    };

    if (position) {
      filter.position = position;
    }

    const banners = await Banner.find(filter)
      .sort({ priority: -1 })
      .select('-createdBy -createdAt -updatedAt');

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    console.error('Get active banners error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch active banners'
    });
  }
};

// @desc    Get banner by ID
// @route   GET /api/banners/:id
// @access  Private (Admin)
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    console.error('Get banner error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch banner'
    });
  }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private (Admin)
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    const {
      title,
      subtitle,
      image,
      backgroundColor,
      backgroundColorEnd,
      textColor,
      buttonText,
      buttonLink,
      position,
      priority,
      startDate,
      endDate,
      status
    } = req.body;

    // Update fields
    if (title !== undefined) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (image !== undefined) banner.image = image;
    if (backgroundColor !== undefined) banner.backgroundColor = backgroundColor;
    if (backgroundColorEnd !== undefined) banner.backgroundColorEnd = backgroundColorEnd;
    if (textColor !== undefined) banner.textColor = textColor;
    if (buttonText !== undefined) banner.buttonText = buttonText;
    if (buttonLink !== undefined) banner.buttonLink = buttonLink;
    if (position !== undefined) banner.position = position;
    if (priority !== undefined) banner.priority = priority;
    if (startDate !== undefined) banner.startDate = startDate;
    if (endDate !== undefined) banner.endDate = endDate;
    if (status !== undefined) banner.status = status;

    await banner.save();

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      data: banner
    });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update banner'
    });
  }
};

// @desc    Toggle banner status
// @route   PUT /api/banners/:id/toggle
// @access  Private (Admin)
export const toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    banner.status = banner.status === 'active' ? 'inactive' : 'active';
    await banner.save();

    res.status(200).json({
      success: true,
      message: `Banner ${banner.status === 'active' ? 'activated' : 'deactivated'}`,
      data: banner
    });
  } catch (error) {
    console.error('Toggle banner status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle banner status'
    });
  }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private (Admin)
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    await banner.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete banner'
    });
  }
};

// @desc    Track banner impression
// @route   POST /api/banners/:id/impression
// @access  Public
export const trackBannerImpression = async (req, res) => {
  try {
    await Banner.findByIdAndUpdate(
      req.params.id,
      { $inc: { impressions: 1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Impression tracked'
    });
  } catch (error) {
    console.error('Track impression error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to track impression'
    });
  }
};

// @desc    Track banner click
// @route   POST /api/banners/:id/click
// @access  Public
export const trackBannerClick = async (req, res) => {
  try {
    await Banner.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Click tracked'
    });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to track click'
    });
  }
};
