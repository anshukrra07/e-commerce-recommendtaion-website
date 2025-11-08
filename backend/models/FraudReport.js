import mongoose from "mongoose";

const fraudReportSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['fake-product', 'payment-fraud', 'account-hijack', 'seller-scam', 'other'],
    default: 'other'
  },
  reportedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'reportedBy.userType'
    },
    userType: {
      type: String,
      enum: ['Customer', 'Seller', 'Admin']
    },
    name: String,
    email: String
  },
  reportedEntity: {
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'reportedEntity.entityType'
    },
    entityType: {
      type: String,
      enum: ['Customer', 'Seller', 'Product', 'Order']
    },
    name: String
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  evidence: {
    type: [String],
    default: []
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  resolution: {
    action: String,
    notes: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  amount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
fraudReportSchema.index({ status: 1, createdAt: -1 });
fraudReportSchema.index({ 'reportedEntity.entityType': 1, 'reportedEntity.entityId': 1 });

const FraudReport = mongoose.model("FraudReport", fraudReportSchema);

export default FraudReport;
