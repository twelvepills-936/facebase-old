import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/adminModel.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const createAdmin = async () => {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI as string);

    const admin = new Admin({
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "admin123",
      role: "superadmin",
    });

    await admin.save();
    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
