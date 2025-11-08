import Message from "../models/Message.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private (Customer or Seller)
export const sendMessage = async (req, res) => {
  try {
    const { productId, receiverId, message } = req.body;
    const senderId = req.user?.id;
    const senderRole = req.user?.role;

    const isValidObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

    if (!productId || !receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide product, receiver, and message"
      });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid productId' });
    }
    if (!isValidObjectId(receiverId)) {
      return res.status(400).json({ success: false, message: 'Invalid receiverId' });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Determine customer and seller
    let customerId, sellerId;
    if (senderRole === 'customer') {
      customerId = senderId;
      sellerId = receiverId;
    } else {
      customerId = receiverId;
      sellerId = senderId;
    }

    // Create message
    const newMessage = await Message.create({
      product: productId,
      customer: customerId,
      seller: sellerId,
      sender: senderRole,
      message: message.trim()
    });

    await newMessage.populate([
      { path: 'customer', select: 'name email' },
      { path: 'seller', select: 'businessName email' },
      { path: 'product', select: 'name image' }
    ]);

    res.status(201).json({
      success: true,
      data: newMessage
    });

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message
    });
  }
};

// @desc    Get conversation for a product
// @route   GET /api/chat/conversation/:productId/:otherUserId
// @access  Private (Customer or Seller)
export const getConversation = async (req, res) => {
  try {
    const { productId, otherUserId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Validate params and auth context
    const isValidObjectId = (v) => mongoose.Types.ObjectId.isValid(v);
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid productId' });
    }
    if (!otherUserId || otherUserId === 'undefined' || !isValidObjectId(otherUserId)) {
      return res.status(400).json({ success: false, message: 'Invalid otherUserId' });
    }
    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({ success: false, message: 'Unauthorized: invalid user id' });
    }
    if (!['customer', 'seller'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Forbidden: invalid user role' });
    }

    // Determine customer and seller
    let customerId, sellerId;
    if (userRole === 'customer') {
      customerId = userId;
      sellerId = otherUserId;
    } else {
      customerId = otherUserId;
      sellerId = userId;
    }

    const messages = await Message.find({
      product: productId,
      customer: customerId,
      seller: sellerId
    })
      .populate('customer', 'name email')
      .populate('seller', 'businessName email')
      .populate('product', 'name image')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversation",
      error: error.message
    });
  }
};

// @desc    Get all chats for seller (grouped by customer and product)
// @route   GET /api/chat/seller/chats
// @access  Private (Seller only)
export const getSellerChats = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    // Build robust pipeline with lookups to ensure ids and names are attached
    const conversations = await Message.aggregate([
      { $match: { seller: sellerId } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: { product: '$product', customer: '$customer' },
          lastMessage: { $last: '$message' },
          lastMessageDate: { $last: '$createdAt' },
          unreadCount: {
            $sum: { $cond: [{ $and: [{ $eq: ['$sender', 'customer'] }, { $eq: ['$read', false] }] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          productId: '$_id.product',
          customerId: '$_id.customer',
          lastMessage: 1,
          lastMessageDate: 1,
          unreadCount: 1
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      { $sort: { lastMessageDate: -1 } },
      {
        $project: {
          productId: 1,
          customerId: 1,
          lastMessage: 1,
          lastMessageDate: 1,
          unreadCount: 1,
          productName: { $ifNull: ['$product.name', ''] },
          customerName: { $ifNull: ['$customer.name', ''] },
          customerEmail: { $ifNull: ['$customer.email', ''] }
        }
      }
    ]);

    const isValidObjectId = (v) => mongoose.Types.ObjectId.isValid(v);
    const formattedConversations = conversations.map(conv => ({
      productId: conv.productId?.toString?.() || undefined,
      customerId: conv.customerId?.toString?.() || undefined,
      productName: conv.productName || 'Unknown Product',
      customerName: conv.customerName || conv.customerEmail || 'Unknown Customer',
      productValid: isValidObjectId(conv.productId),
      customerValid: isValidObjectId(conv.customerId),
      lastMessage: conv.lastMessage,
      lastMessageDate: conv.lastMessageDate,
      unreadCount: conv.unreadCount
    }));

    res.status(200).json({
      success: true,
      data: formattedConversations
    });

  } catch (error) {
    console.error("Error fetching seller chats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
      error: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/mark-read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { productId, otherUserId } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const isValidObjectId = (v) => mongoose.Types.ObjectId.isValid(v);
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid productId' });
    }
    if (!isValidObjectId(otherUserId)) {
      return res.status(400).json({ success: false, message: 'Invalid otherUserId' });
    }
    if (!isValidObjectId(userId)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let query = { product: productId };
    
    if (userRole === 'customer') {
      query.customer = userId;
      query.seller = otherUserId;
      query.sender = 'seller';
    } else {
      query.seller = userId;
      query.customer = otherUserId;
      query.sender = 'customer';
    }

    await Message.updateMany(query, { read: true });

    res.status(200).json({
      success: true,
      message: "Messages marked as read"
    });

  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message
    });
  }
};

// @desc    Delete a conversation (all messages for a product <-> other user)
// @route   DELETE /api/chat/conversation
// @access  Private (Customer or Seller)
export const deleteConversation = async (req, res) => {
  try {
    const { productId, otherUserId } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const isValidObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

    if (!isValidObjectId(productId) || !isValidObjectId(otherUserId) || !isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid identifiers' });
    }

    const query = { product: productId };
    if (userRole === 'customer') {
      query.customer = userId;
      query.seller = otherUserId;
    } else {
      query.seller = userId;
      query.customer = otherUserId;
    }

    const result = await Message.deleteMany(query);
    return res.status(200).json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete conversation', error: error.message });
  }
};

// @desc    Cleanup seller chats with missing product/customer references
// @route   DELETE /api/chat/seller/cleanup
// @access  Private (Seller only)
export const cleanupSellerChats = async (req, res) => {
  try {
    const sellerId = req.user?.id;
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Load messages to collect referenced IDs
    const msgs = await Message.find({ seller: sellerId }).select('product customer');

    const productIds = new Set();
    const customerIds = new Set();
    for (const m of msgs) {
      if (m.product && mongoose.Types.ObjectId.isValid(m.product)) productIds.add(m.product.toString());
      if (m.customer && mongoose.Types.ObjectId.isValid(m.customer)) customerIds.add(m.customer.toString());
    }

    // Fetch existing documents
    const existingProducts = await Product.find({ _id: { $in: Array.from(productIds) } }).select('_id');
    const existingProductSet = new Set(existingProducts.map(p => p._id.toString()));

    // Lazy-load Customer to avoid import at top; use dynamic import pattern
    const { default: Customer } = await import('../models/Customer.js');
    const existingCustomers = await Customer.find({ _id: { $in: Array.from(customerIds) } }).select('_id');
    const existingCustomerSet = new Set(existingCustomers.map(c => c._id.toString()));

    // Delete messages where refs are missing or invalid
    const toDelete = await Message.find({ seller: sellerId }).select('_id product customer');
    const invalidIds = toDelete
      .filter(m => !m.product || !m.customer ||
        !mongoose.Types.ObjectId.isValid(m.product) ||
        !mongoose.Types.ObjectId.isValid(m.customer) ||
        !existingProductSet.has(m.product.toString()) ||
        !existingCustomerSet.has(m.customer.toString()))
      .map(m => m._id);

    if (invalidIds.length > 0) {
      await Message.deleteMany({ _id: { $in: invalidIds } });
    }

    return res.status(200).json({ success: true, cleaned: invalidIds.length });
  } catch (error) {
    console.error('Error cleaning up chats:', error);
    return res.status(500).json({ success: false, message: 'Failed to cleanup chats', error: error.message });
  }
};
