require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sportify");
    console.log("Connected to MongoDB...");

    const name = process.env.ADMIN_NAME || "Sportify Admin";
    const email = (process.env.ADMIN_EMAIL || "admin@sportify.com").toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "Admin1234";

    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = "superadmin";
      existing.password = await bcrypt.hash(password, 12);
      await existing.save();
      console.log(`Existing user "${email}" promoted to superadmin and password reset.`);
    } else {
      const hashed = await bcrypt.hash(password, 12);
      await User.create({ name, email, password: hashed, role: "superadmin" });
      console.log(`Superadmin created: ${email} / ${password}`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Create admin error:", err);
    process.exit(1);
  }
}

createAdmin();
