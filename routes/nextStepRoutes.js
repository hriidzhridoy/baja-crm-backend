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
    .populate("completedBy", "name email role")
    .sort({ nextActionDate: 1, nextActionTime: 1, createdAt: -1 });

  res.json(steps);
});

router.get("/client/:clientId", protect, async (req, res) => {
  const steps = await NextStep.find({ clientId: req.params.clientId })
    .populate("createdBy", "name email role")
    .populate("completedBy", "name email role")
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

    const createdStep = await NextStep.findById(step._id).populate(
      "createdBy",
      "name email role",
    ).populate("completedBy", "name email role");

    res.status(201).json(createdStep);
  },
);

router.put("/:id", protect, allowRoles("admin", "editor"), async (req, res) => {
  const step = await NextStep.findById(req.params.id);

  if (!step) {
    return res.status(404).json({ message: "Task not found" });
  }

  step.note = req.body.note ?? step.note;
  step.nextActionDate = req.body.nextActionDate ?? step.nextActionDate;
  step.nextActionTime = req.body.nextActionTime ?? step.nextActionTime;

  if (req.body.status !== undefined) {
    if (!["Open", "Done"].includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid task status" });
    }

    if (req.body.status === "Done" && step.status !== "Done") {
      step.completedAt = new Date();
      step.completedBy = req.user._id;
    }

    if (req.body.status === "Open") {
      step.completedAt = undefined;
      step.completedBy = undefined;
    }

    step.status = req.body.status;
  }

  await step.save();

  const updatedStep = await NextStep.findById(step._id).populate(
    "createdBy",
    "name email role",
  ).populate("completedBy", "name email role");

  await Client.findByIdAndUpdate(updatedStep.clientId, {
    lastConversationDate: new Date().toISOString().slice(0, 10),
    updatedBy: req.user._id,
  });

  res.json(updatedStep);
});

router.delete(
  "/:id",
  protect,
  allowRoles("admin", "editor"),
  async (req, res) => {
    const step = await NextStep.findById(req.params.id);

    if (!step) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Client.findByIdAndUpdate(step.clientId, {
      lastConversationDate: new Date().toISOString().slice(0, 10),
      updatedBy: req.user._id,
    });

    await step.deleteOne();

    res.json({ message: "Task deleted" });
  },
);

export default router;
