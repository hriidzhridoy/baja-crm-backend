import mongoose from "mongoose";

export const reminderStatuses = ["Open", "Done", "Converted"];

const reminderSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    contactPerson: String,
    phone: String,
    location: String,
    note: { type: String, required: true },
    reminderDate: String,
    reminderTime: String,
    status: {
      type: String,
      enum: reminderStatuses,
      default: "Open",
    },
    agentFromBPW: String,
    convertedClientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Reminder", reminderSchema);
