import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a product name"],
    trim: true
  },
  category: {
    type: String,
    required: [true, "Please provide a category"],
    enum: ["electronics", "clothing", "footwear", "accessories", "home-decor"],
    default: "electronics"
  },
  price: {
    type: Number,
    required: [true, "Please provide a price"],
    min: [0, "Price cannot be negative"]
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, "Discount cannot be negative"],
    max: [100, "Discount cannot exceed 100%"]
  },
  stock: {
    type: Number,
    required: [true, "Please provide stock quantity"],
    min: [0, "Stock cannot be negative"]
  },
  image: {
    type: String,
    required: [true, "Please provide a product image/emoji"],
    trim: true
  },
  images: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    required: [true, "Please provide a product description"],
    trim: true
  },
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  keyFeatures: {
    type: [String],
    default: []
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  submittedDate: {
    type: Date,
    default: Date.now
  },
  sold: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for calculating final price after discount
productSchema.virtual('finalPrice').get(function() {
  return this.price - (this.price * this.discount / 100);
});

// Virtual for calculating original price (for display)
productSchema.virtual('originalPrice').get(function() {
  if (this.discount > 0) {
    return Math.round(this.price / (1 - this.discount / 100));
  }
  return this.price;
});

const Product = mongoose.model("Product", productSchema);

export default Product;
