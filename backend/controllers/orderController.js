import Order from '../models/Order.js';

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('items.productId', 'name price images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user has access to this order
    if (req.user && order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch order' });
  }
};

// Get all orders for a customer
export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user._id;
    const orders = await Order.find({ customer: customerId })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name price images');

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch orders' });
  }
};

// Update order fulfillment status (Admin/Seller only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, eventCode, eventDescription } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.fulfillment.status = status;
    order.fulfillment.events.push({
      code: eventCode || status.toUpperCase(),
      description: eventDescription || `Order status changed to ${status}`,
      at: new Date()
    });
    await order.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${order.customer}`).emit('order:update', { orderId: order._id, status });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update order' });
  }
};

// Get orders for seller's products
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Find all products by this seller
    const Product = (await import('../models/Product.js')).default;
    const sellerProducts = await Product.find({ seller: sellerId }).select('_id name');
    const productIds = sellerProducts.map(p => p._id);
    
    // Find orders containing any of these products
    const orders = await Order.find({
      'items.productId': { $in: productIds },
      'payment.status': 'paid' // Only show paid orders
    })
    .populate('customer', 'name email')
    .populate('items.productId', 'name image')
    .sort({ createdAt: -1 });
    
    // Transform orders to seller-friendly format
    const sellerOrders = [];
    let itemIndex = 0;
    orders.forEach(order => {
      order.items.forEach(item => {
        // Only include items that belong to this seller
        if (productIds.some(id => id.toString() === item.productId._id.toString())) {
          sellerOrders.push({
            id: `#ORD-${order._id.toString().slice(-6)}-${itemIndex}`,
            orderId: order._id,
            productName: item.name,
            productId: item.productId._id,
            customer: order.customer.name,
            customerEmail: order.customer.email,
            quantity: item.qty,
            total: item.price * item.qty,
            status: order.fulfillment.status,
            payment: order.payment.status,
            date: order.createdAt.toLocaleDateString(),
            shippingAddress: order.shippingAddress
          });
          itemIndex++;
        }
      });
    });
    
    res.status(200).json({ success: true, data: sellerOrders });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch seller orders' });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check ownership
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Can only cancel if not shipped
    if (['shipped', 'delivered'].includes(order.fulfillment.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel shipped/delivered orders' });
    }

    order.fulfillment.status = 'cancelled';
    order.fulfillment.events.push({
      code: 'ORDER_CANCELLED',
      description: 'Order cancelled by customer',
      at: new Date()
    });
    await order.save();

    // Revert product metrics if order was paid
    if (order.payment.status === 'paid') {
      const Product = (await import('../models/Product.js')).default;
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: {
              sold: -item.qty,
              revenue: -(item.price * item.qty)
            }
          }
        );
      }
    }

    // Emit update
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${order.customer}`).emit('order:update', { orderId: order._id, status: 'cancelled' });
    }

    res.status(200).json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to cancel order' });
  }
};
