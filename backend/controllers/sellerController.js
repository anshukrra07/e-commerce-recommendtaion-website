import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Seller from "../models/Seller.js";

/**
 * Generate JWT token
 */
const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};

/**
 * @desc    Register a new seller (pending approval)
 * @route   POST /api/sellers/signup
 * @access  Public
 */
export const signup = async (req, res) => {
  try {
    const { businessName, ownerName, email, password, phone, businessAddress, gstNumber, bankAccount } = req.body;

    // Validate required fields
    if (!businessName || !ownerName || !email || !password || !phone || !businessAddress) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: "Seller with this email already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create seller with pending status
    const seller = await Seller.create({
      businessName,
      ownerName,
      email,
      password: hashedPassword,
      phone,
      businessAddress,
      gstNumber,
      bankAccount,
      status: "pending"
    });

    // Return response WITHOUT token (seller must be approved first)
    res.status(201).json({
      success: true,
      message: "Seller registration submitted successfully. Your account is pending admin approval.",
      seller: {
        id: seller._id,
        businessName: seller.businessName,
        ownerName: seller.ownerName,
        email: seller.email,
        phone: seller.phone,
        businessAddress: seller.businessAddress,
        gstNumber: seller.gstNumber,
        bankAccount: seller.bankAccount,
        status: seller.status,
        submittedDate: seller.submittedDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering seller",
      error: error.message
    });
  }
};

/**
 * @desc    Login seller (only if approved)
 * @route   POST /api/sellers/login
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

    // Find seller by email
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, seller.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // CRITICAL: Check seller approval status
    if (seller.status === "pending") {
      return res.status(401).json({
        success: false,
        message: "Your account is pending approval. Please wait for admin approval."
      });
    }

    if (seller.status === "rejected") {
      return res.status(401).json({
        success: false,
        message: "Your account has been rejected. Please contact support for more information."
      });
    }

    // Only approved sellers can login
    if (seller.status !== "approved") {
      return res.status(401).json({
        success: false,
        message: "Your account status does not allow login."
      });
    }

    // Generate token
    const token = generateToken(seller._id, seller.email, "seller");

    // Return response (exclude password)
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      seller: {
        id: seller._id,
        businessName: seller.businessName,
        ownerName: seller.ownerName,
        email: seller.email,
        phone: seller.phone,
        businessAddress: seller.businessAddress,
        gstNumber: seller.gstNumber,
        bankAccount: seller.bankAccount,
        status: seller.status,
        submittedDate: seller.submittedDate
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
 * @desc    Get seller by ID or name (public)
 * @route   GET /api/sellers/:sellerId
 * @access  Public
 */
export const getSellerById = async (req, res) => {
  try {
    const { sellerId } = req.params; // can be ObjectId or name/slug

    // Helper to escape regex special chars
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    let seller = null;

    // First try by ObjectId when it looks like one
    if (mongoose.Types.ObjectId.isValid(sellerId)) {
      seller = await Seller.findById(sellerId).select('-password');
    }

    // Fallback: treat param as a seller name (supports slug like "my-store-name")
    if (!seller) {
      const decoded = decodeURIComponent(sellerId);
      const nameGuess = decoded.replace(/-/g, ' ').trim();
      if (nameGuess.length > 0) {
        seller = await Seller.findOne({
          businessName: { $regex: new RegExp(`^${escapeRegex(nameGuess)}$`, 'i') }
        }).select('-password');
      }
    }

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    // Only return approved sellers for public access
    if (seller.status !== "approved") {
      return res.status(404).json({
        success: false,
        message: "Seller not found or not available"
      });
    }

    res.status(200).json({
      success: true,
      data: seller
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching seller",
      error: error.message
    });
  }
};
