import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';

// Lazy initialization of Razorpay (after env is loaded)
let razorpayInstance = null;

function getRazorpayInstance() {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Razorpay initialized with key_id:', process.env.RAZORPAY_KEY_ID);
  }
  return razorpayInstance;
}

// Create checkout session
export const createCheckout = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    const customerId = req.user._id; // From auth middleware

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Calculate amounts
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const shipping = subtotal > 5000 ? 0 : 199; // Free shipping over ₹5000
    const total = subtotal + tax + shipping;

    // Create order in database
    const order = await Order.create({
      customer: customerId,
      items: items.map(it => ({
        productId: it.productId,
        name: it.name,
        price: it.price,
        qty: it.qty,
        image: it.image
      })),
      amounts: { subtotal, tax, shipping, discount: 0, total },
      shippingAddress,
      payment: { status: 'pending' },
      fulfillment: { 
        status: 'created',
        events: [{ code: 'ORDER_CREATED', description: 'Order created', at: new Date() }]
      }
    });

    // Check demo mode
    const DEMO_MODE = process.env.RAZORPAY_DEMO_MODE === 'true';
    
    // Create Razorpay order or use demo mode
    if (DEMO_MODE) {
      // Demo mode - skip Razorpay
      order.payment.razorpayOrderId = `demo_${order._id}`;
      await order.save();

      res.status(200).json({
        success: true,
        demoMode: true,
        orderId: order._id,
        rzpOrderId: `demo_${order._id}`,
        keyId: 'demo_key',
        amount: total * 100,
        currency: 'INR'
      });
    } else {
      // Real Razorpay integration
      console.log('Creating Razorpay order with key_id:', process.env.RAZORPAY_KEY_ID);
      
      try {
        const razorpay = getRazorpayInstance();
        const rzpOrder = await razorpay.orders.create({
          amount: total * 100, // Amount in paise
          currency: 'INR',
          receipt: order._id.toString(),
          notes: {
            orderId: order._id.toString(),
            customerId: customerId.toString()
          }
        });

        console.log('Razorpay order created successfully:', rzpOrder.id);

        // Update order with Razorpay order ID
        order.payment.razorpayOrderId = rzpOrder.id;
        await order.save();

        res.status(200).json({
          success: true,
          orderId: order._id,
          rzpOrderId: rzpOrder.id,
          keyId: process.env.RAZORPAY_KEY_ID,
          amount: total * 100,
          currency: 'INR'
        });
      } catch (rzpError) {
        console.error('Razorpay API error:', rzpError);
        throw new Error(`Razorpay error: ${rzpError.error?.description || rzpError.message}`);
      }
    }
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, message: error.message || 'Checkout failed' });
  }
};

// Verify Razorpay payment
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check demo mode
    const DEMO_MODE = process.env.RAZORPAY_DEMO_MODE === 'true';
    
    // Verify signature (skip in demo mode)
    if (DEMO_MODE) {
      // Demo mode - auto-approve
      console.log('Demo mode: Auto-approving payment');
    } else {
      // Real verification
      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
        .update(text)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        order.payment.status = 'failed';
        await order.save();
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    }

    // Update order as paid
    order.payment.status = 'paid';
    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.razorpaySignature = razorpay_signature;
    order.payment.paidAt = new Date();
    order.fulfillment.status = 'processing';
    order.fulfillment.events.push({
      code: 'PAYMENT_CONFIRMED',
      description: 'Payment received and confirmed',
      at: new Date()
    });
    await order.save();

    // Update product metrics (revenue and sold)
    const Product = (await import('../models/Product.js')).default;
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            sold: item.qty,
            revenue: item.price * item.qty
          }
        }
      );
    }

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${order.customer}`).emit('order:update', { orderId: order._id, status: 'paid' });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      orderId: order._id
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, message: error.message || 'Verification failed' });
  }
};
