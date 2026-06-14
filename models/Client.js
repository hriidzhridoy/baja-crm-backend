import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    agentFromBPW: String,
    companyName: { type: String, required: true },
    meetingDate: String,
    personMetWith: { type: String, required: true },
    signerName: String,
    email: String,
    phone: String,
    address: String,
    lastConversationDate: String,
    conversationNotes: String,
    rmr: { type: Number, default: 0 },
    stage: {
      type: String,
      enum: [
        "New Lead",
        "Contacted",
        "Meeting Completed",
        "Proposal Sent",
        "Follow-Up",
        "Agreement Pending",
        "Closed Won",
        "Closed Lost",
      ],
      default: "New Lead",
    },
    estimatedClosingDate: String,
    unitType: String,
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("Client", clientSchema);
