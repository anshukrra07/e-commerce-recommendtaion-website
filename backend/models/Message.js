import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true
  },
  sender: {
    type: String,
    enum: ['customer', 'seller'],
    required: true
  },
  message: {
    type: String,
    required: [true, "Message cannot be empty"],
    trim: true,
    maxlength: [1000, "Message cannot exceed 1000 characters"]
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ product: 1, customer: 1, seller: 1, createdAt: -1 });
messageSchema.index({ seller: 1, read: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
