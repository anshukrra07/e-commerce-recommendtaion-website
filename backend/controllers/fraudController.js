import FraudReport from '../models/FraudReport.js';

// @desc    Create a new fraud report
// @route   POST /api/fraud/report
// @access  Private (Customer/Seller)
export const createFraudReport = async (req, res) => {
  try {
    const { type, reportedEntity, description, evidence, severity, amount } = req.body;

    const fraudReport = await FraudReport.create({
      type,
      reportedBy: {
        userId: req.user._id,
        userType: req.user.role === 'customer' ? 'Customer' : 'Seller',
        name: req.user.name || req.user.businessName,
        email: req.user.email
      },
      reportedEntity,
      description,
      evidence: evidence || [],
      severity: severity || 'medium',
      amount: amount || 0,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Fraud report submitted successfully',
      data: fraudReport
    });
  } catch (error) {
    console.error('Create fraud report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create fraud report'
    });
  }
};

// @desc    Get all fraud reports (Admin only)
// @route   GET /api/fraud/reports
// @access  Private (Admin)
export const getAllFraudReports = async (req, res) => {
  try {
    const { status, type, severity } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;

    const fraudReports = await FraudReport.find(filter)
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email')
      .populate('resolution.resolvedBy', 'name email');

    res.status(200).json({
      success: true,
      count: fraudReports.length,
      data: fraudReports
    });
  } catch (error) {
    console.error('Get fraud reports error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch fraud reports'
    });
  }
};

// @desc    Get fraud report by ID
// @route   GET /api/fraud/reports/:id
// @access  Private (Admin)
export const getFraudReportById = async (req, res) => {
  try {
    const fraudReport = await FraudReport.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('resolution.resolvedBy', 'name email');

    if (!fraudReport) {
      return res.status(404).json({
        success: false,
        message: 'Fraud report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: fraudReport
    });
  } catch (error) {
    console.error('Get fraud report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch fraud report'
    });
  }
};

// @desc    Update fraud report status
// @route   PUT /api/fraud/reports/:id/status
// @access  Private (Admin)
export const updateFraudReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const fraudReport = await FraudReport.findById(req.params.id);
    
    if (!fraudReport) {
      return res.status(404).json({
        success: false,
        message: 'Fraud report not found'
      });
    }

    fraudReport.status = status;
    
    if (status === 'investigating') {
      fraudReport.assignedTo = req.user._id;
    }

    await fraudReport.save();

    res.status(200).json({
      success: true,
      message: `Fraud report status updated to ${status}`,
      data: fraudReport
    });
  } catch (error) {
    console.error('Update fraud report status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update fraud report status'
    });
  }
};

// @desc    Resolve fraud report
// @route   PUT /api/fraud/reports/:id/resolve
// @access  Private (Admin)
export const resolveFraudReport = async (req, res) => {
  try {
    const { action, notes } = req.body;

    const fraudReport = await FraudReport.findById(req.params.id);
    
    if (!fraudReport) {
      return res.status(404).json({
        success: false,
        message: 'Fraud report not found'
      });
    }

    fraudReport.status = 'resolved';
    fraudReport.resolution = {
      action,
      notes,
      resolvedAt: new Date(),
      resolvedBy: req.user._id
    };

    await fraudReport.save();

    res.status(200).json({
      success: true,
      message: 'Fraud report resolved successfully',
      data: fraudReport
    });
  } catch (error) {
    console.error('Resolve fraud report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resolve fraud report'
    });
  }
};

// @desc    Dismiss fraud report
// @route   DELETE /api/fraud/reports/:id
// @access  Private (Admin)
export const dismissFraudReport = async (req, res) => {
  try {
    const fraudReport = await FraudReport.findById(req.params.id);
    
    if (!fraudReport) {
      return res.status(404).json({
        success: false,
        message: 'Fraud report not found'
      });
    }

    await fraudReport.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Fraud report dismissed and deleted'
    });
  } catch (error) {
    console.error('Dismiss fraud report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to dismiss fraud report'
    });
  }
};

// @desc    Get fraud statistics
// @route   GET /api/fraud/stats
// @access  Private (Admin)
export const getFraudStats = async (req, res) => {
  try {
    const total = await FraudReport.countDocuments();
    const pending = await FraudReport.countDocuments({ status: 'pending' });
    const investigating = await FraudReport.countDocuments({ status: 'investigating' });
    const resolved = await FraudReport.countDocuments({ status: 'resolved' });
    
    const byType = await FraudReport.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const bySeverity = await FraudReport.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        investigating,
        resolved,
        byType,
        bySeverity
      }
    });
  } catch (error) {
    console.error('Get fraud stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch fraud statistics'
    });
  }
};
