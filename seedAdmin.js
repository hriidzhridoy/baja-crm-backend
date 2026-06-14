import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();
await connectDB();

const createAdmin = async () => {
  try {
    const exists = await User.findOne({ email: "admin@bpw.com" });

    if (exists) {
      console.log("Admin already exists");
      process.exit();
    }

    await User.create({
      name: "BPW Admin",
      email: "admin@bpw.com",
      password: "password123",
      role: "admin",
    });

    console.log("Admin created");
    console.log("Email: admin@bpw.com");
    console.log("Password: password123");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();
