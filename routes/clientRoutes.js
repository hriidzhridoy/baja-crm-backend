import express from "express";
import Client from "../models/Client.js";
import NextStep from "../models/NextStep.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const clients = await Client.find().sort({ createdAt: -1 });
  res.json(clients);
});

router.get("/:id", protect, async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  res.json(client);
});

router.post("/", protect, allowRoles("admin", "editor"), async (req, res) => {
  const client = await Client.create({
    ...req.body,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res.status(201).json(client);
});

router.put("/:id", protect, allowRoles("admin", "editor"), async (req, res) => {
  const client = await Client.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedBy: req.user._id,
    },
    { new: true, runValidators: true },
  );

  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  res.json(client);
});

router.delete("/:id", protect, allowRoles("admin"), async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  await NextStep.deleteMany({ clientId: client._id });
  await client.deleteOne();

  res.json({ message: "Client deleted" });
});

export default router;
