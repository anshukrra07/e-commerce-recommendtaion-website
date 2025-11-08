import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Seller from "../models/Seller.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

/**
 * Generate JWT token
 */
const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};

/**
 * @desc    Login admin
 * @route   POST /api/admin/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate token
    const token = generateToken(admin._id, admin.email, "admin");

    // Return response (exclude password)
    res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message
    });
  }
};

/**
 * @desc    Get all pending sellers
 * @route   GET /api/admin/sellers/pending
 * @access  Private (Admin only)
 */
export const getPendingSellers = async (req, res) => {
  try {
    const pendingSellers = await Seller.find({ status: "pending" })
      .select("-password")
      .sort({ submittedDate: -1 });

    res.status(200).json({
      success: true,
      count: pendingSellers.length,
      sellers: pendingSellers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching pending sellers",
      error: error.message
    });
  }
};

/**
 * @desc    Approve a seller
 * @route   PUT /api/admin/sellers/:id/approve
 * @access  Private (Admin only)
 */
export const approveSeller = async (req, res) => {
  try {
    const { id } = req.params;

    // Find seller and update status to approved
    const seller = await Seller.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true, runValidators: true }
    ).select("-password");

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `Seller "${seller.businessName}" has been approved successfully`,
      seller
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error approving seller",
      error: error.message
    });
  }
};

/**
 * @desc    Reject and delete a seller
 * @route   DELETE /api/admin/sellers/:id/reject
 * @access  Private (Admin only)
 */
export const rejectSeller = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete seller
    const seller = await Seller.findByIdAndDelete(id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `Seller "${seller.businessName}" has been rejected and removed from the system`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error rejecting seller",
      error: error.message
    });
  }
};

/**
 * @desc    Get all customers
 * @route   GET /api/admin/customers
 * @access  Private (Admin only)
 */
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

/**
 * @desc    Get all sellers
 * @route   GET /api/admin/sellers
 * @access  Private (Admin only)
 */
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sellers.length,
      sellers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sellers',
      error: error.message
    });
  }
};

/**
 * @desc    Get platform analytics/stats
 * @route   GET /api/admin/analytics
 * @access  Private (Admin only)
 */
export const getAdminAnalytics = async (req, res) => {
  try {
    // Count totals
    const totalCustomers = await Customer.countDocuments();
    const totalSellers = await Seller.countDocuments({ status: 'approved' });
    const totalProducts = await Product.countDocuments({ status: 'approved' });
    const totalOrders = await Order.countDocuments();
    const pendingSellers = await Seller.countDocuments({ status: 'pending' });
    const pendingProducts = await Product.countDocuments({ status: 'pending' });

    // Calculate revenue
    const orders = await Order.find({ 'payment.status': 'paid' });
    const totalRevenue = orders.reduce((sum, order) => sum + order.amounts.total, 0);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newCustomers = await Customer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newSellers = await Seller.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const recentOrders = await Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.status(200).json({
      success: true,
      analytics: {
        totalCustomers,
        totalSellers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingSellers,
        pendingProducts,
        recentActivity: {
          newCustomers,
          newSellers,
          recentOrders
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin analytics',
      error: error.message
    });
  }
};
