import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";

dotenv.config();

/**
 * Script to create an admin user
 * Usage: node scripts/createAdmin.js
 */
const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Admin details from .env or hardcoded
    const adminData = {
      name: process.env.ADMIN_NAME || "Super Admin",
      email: process.env.ADMIN_EMAIL || "admin@eshop.com",
      password: process.env.ADMIN_PASSWORD || "admin123"
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log(`⚠️  Admin with email ${adminData.email} already exists`);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin
    const admin = await Admin.create({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: "admin"
    });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", admin.email);
    console.log("👤 Name:", admin.name);
    console.log("\n🔐 You can now login with these credentials");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
