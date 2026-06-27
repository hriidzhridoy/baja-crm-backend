import express from "express";
import NextStep from "../models/NextStep.js";
import Client from "../models/Client.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const query = req.query.date ? { nextActionDate: req.query.date } : {};

  const steps = await NextStep.find(query)
    .populate("clientId", "companyName personMetWith phone stage")
    .populate("createdBy", "name email role")
    .sort({ nextActionDate: 1, nextActionTime: 1, createdAt: -1 });

  res.json(steps);
});

router.get("/client/:clientId", protect, async (req, res) => {
  const steps = await NextStep.find({ clientId: req.params.clientId })
    .populate("createdBy", "name email role")
    .sort({ nextActionDate: 1, nextActionTime: 1, createdAt: -1 });

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
      nextActionTime: req.body.nextActionTime,
      createdBy: req.user._id,
    });

    await Client.findByIdAndUpdate(req.params.clientId, {
      lastConversationDate: new Date().toISOString().slice(0, 10),
      updatedBy: req.user._id,
    });

    res.status(201).json(step);
  },
);

export default router;
