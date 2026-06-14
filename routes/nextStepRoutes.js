import express from "express";
import NextStep from "../models/NextStep.js";
import Client from "../models/Client.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/client/:clientId", protect, async (req, res) => {
  const steps = await NextStep.find({ clientId: req.params.clientId })
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  res.json(steps);
});

router.post(
  "/client/:clientId",
  protect,
  allowRoles("admin", "editor"),
  async (req, res) => {
    const client = await Client.findById(req.params.clientId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const step = await NextStep.create({
      clientId: req.params.clientId,
      note: req.body.note,
      nextActionDate: req.body.nextActionDate,
      createdBy: req.user._id,
    });

    client.lastConversationDate = new Date().toISOString().slice(0, 10);
    client.updatedBy = req.user._id;
    await client.save();

    res.status(201).json(step);
  },
);

export default router;
