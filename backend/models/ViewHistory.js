import mongoose from "mongoose";

const viewHistorySchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
    index: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true
  },
  category: {
    type: String
  },
  duration: {
    type: Number, // Time spent on product page in seconds
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
viewHistorySchema.index({ customer: 1, createdAt: -1 });
viewHistorySchema.index({ product: 1, createdAt: -1 });

const ViewHistory = mongoose.model("ViewHistory", viewHistorySchema);

export default ViewHistory;
