import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    qty: { type: Number, required: true, min: 1 },
    image: String
  }],
  amounts: {
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  shippingAddress: {
    name: String,
    phone: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  payment: {
    method: { type: String, default: 'razorpay' },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paidAt: Date
  },
  fulfillment: {
    status: { type: String, enum: ['created', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'created' },
    events: [{
      code: String,
      description: String,
      at: { type: Date, default: Date.now }
    }]
  },
  invoice: {
    number: String,
    url: String,
    generatedAt: Date
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
