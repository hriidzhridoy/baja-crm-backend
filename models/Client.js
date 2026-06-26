import mongoose from "mongoose";

export const clientCityZonesByCity = {
  "Cabo San Lucas": ["Cabo Zone 1", "Cabo Zone 2"],
  "San José del Cabo": ["San José Zone 1", "San José Zone 2"],
};

export const clientCities = Object.keys(clientCityZonesByCity);
export const clientCityZones = Object.values(clientCityZonesByCity).flat();

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
    city: { type: String, required: true, enum: clientCities },
    cityZone: { type: String, required: true, enum: clientCityZones },
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
