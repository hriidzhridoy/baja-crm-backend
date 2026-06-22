import mongoose from "mongoose";
import dns from "node:dns";

const connectDB = async () => {
  try {
    if (dns.getServers().includes("127.0.0.1")) {
      dns.setServers(["1.1.1.1", "8.8.8.8"]);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
