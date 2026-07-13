import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();
await connectDB();

const createAdmin = async () => {
  try {
    const email = "steve@bajapurewater.com";

    const exists = await User.findOne({ email });

    if (exists) {
      console.log("Steve admin already exists");
      process.exit(0);
    }

    await User.create({
      name: "Steve",
      email,
      password: "stevejasco33##",
      role: "admin",
    });

    console.log("Steve admin created successfully");
    console.log(`Email: ${email}`);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create Steve admin:", error);
    process.exit(1);
  }
};

createAdmin();
