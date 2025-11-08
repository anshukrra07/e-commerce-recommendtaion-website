import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  backgroundColor: {
    type: String,
    default: '#FF6B6B'
  },
  backgroundColorEnd: {
    type: String,
    trim: true
  },
  textColor: {
    type: String,
    default: '#FFFFFF'
  },
  buttonText: {
    type: String,
    default: 'Shop Now'
  },
  buttonLink: {
    type: String,
    default: '/shop'
  },
  position: {
    type: String,
    enum: ['homepage-top', 'homepage-middle', 'homepage-bottom', 'category-top', 'product-sidebar'],
    default: 'homepage-top'
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 100
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'scheduled', 'expired'],
    default: 'active'
  },
  impressions: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for CTR (Click-Through Rate)
bannerSchema.virtual('ctr').get(function() {
  if (this.impressions === 0) return 0;
  return ((this.clicks / this.impressions) * 100).toFixed(2);
});

// Method to check if banner is currently active
bannerSchema.methods.isActive = function() {
  if (this.status !== 'active') return false;
  
  const now = new Date();
  
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  
  return true;
};

// Index for faster queries
bannerSchema.index({ status: 1, position: 1, priority: -1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
