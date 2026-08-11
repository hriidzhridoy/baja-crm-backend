import mongoose from "mongoose";

const nextStepSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    note: { type: String, required: true },
    nextActionDate: String,
    nextActionTime: String,
    status: {
      type: String,
      enum: ["Open", "Done"],
      default: "Open",
    },
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("NextStep", nextStepSchema);
