import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, "Please provide a business name"],
    trim: true
  },
  ownerName: {
    type: String,
    required: [true, "Please provide owner name"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password must be at least 6 characters"]
  },
  phone: {
    type: String,
    required: [true, "Please provide a phone number"],
    trim: true
  },
  businessAddress: {
    type: String,
    required: [true, "Please provide business address"],
    trim: true
  },
  gstNumber: {
    type: String,
    trim: true,
    default: ''
  },
  bankAccount: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  submittedDate: {
    type: Date,
    default: Date.now
  }
});

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;
