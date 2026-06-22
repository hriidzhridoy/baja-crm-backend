import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import nextStepRoutes from "./routes/nextStepRoutes.js";

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "https://bajapurewater.com",
  "https://www.bajapurewater.com",
  "http://bajapurewater.com",
  "http://www.bajapurewater.com",
  "http://localhost:8080",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("/*splat", cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("BPW CRM API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/next-steps", nextStepRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
