import express from "express";
import Reminder, { reminderStatuses } from "../models/Reminder.js";
import Client from "../models/Client.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

const validateReminder = (payload) => {
  if (!payload.companyName?.trim()) return "Company name is required.";
  if (!payload.note?.trim()) return "Reminder note is required.";
  if (payload.status && !reminderStatuses.includes(payload.status)) {
    return "Invalid reminder status.";
  }

  return null;
};

router.get("/", protect, async (req, res) => {
  const query = {};

  if (req.query.status && req.query.status !== "All") {
    query.status = req.query.status;
  }

  if (req.query.agent && req.query.agent !== "All") {
    query.agentFromBPW = req.query.agent;
  }

  const reminders = await Reminder.find(query)
    .populate("createdBy", "name email role")
    .populate("convertedClientId", "companyName personMetWith phone stage")
    .sort({ reminderDate: 1, reminderTime: 1, createdAt: -1 });

  res.json(reminders);
});

router.get("/:id", protect, async (req, res) => {
  const reminder = await Reminder.findById(req.params.id)
    .populate("createdBy", "name email role")
    .populate("convertedClientId", "companyName personMetWith phone stage");

  if (!reminder) {
    return res.status(404).json({ message: "Reminder not found" });
  }

  res.json(reminder);
});

router.post("/", protect, allowRoles("admin", "editor"), async (req, res) => {
  const validationError = validateReminder(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const reminder = await Reminder.create({
    ...req.body,
    status: req.body.status || "Open",
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  const populatedReminder = await Reminder.findById(reminder._id).populate(
    "createdBy",
    "name email role",
  );

  res.status(201).json(populatedReminder);
});

router.put("/:id", protect, allowRoles("admin", "editor"), async (req, res) => {
  const existingReminder = await Reminder.findById(req.params.id);

  if (!existingReminder) {
    return res.status(404).json({ message: "Reminder not found" });
  }

  const nextPayload = {
    ...existingReminder.toObject(),
    ...req.body,
  };
  const validationError = validateReminder(nextPayload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  if (req.body.convertedClientId) {
    const client = await Client.findById(req.body.convertedClientId);

    if (!client) {
      return res.status(404).json({ message: "Converted client not found" });
    }
  }

  const reminder = await Reminder.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedBy: req.user._id,
    },
    { new: true, runValidators: true },
  )
    .populate("createdBy", "name email role")
    .populate("convertedClientId", "companyName personMetWith phone stage");

  res.json(reminder);
});

router.delete(
  "/:id",
  protect,
  allowRoles("admin", "editor"),
  async (req, res) => {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    await reminder.deleteOne();

    res.json({ message: "Reminder deleted" });
  },
);

export default router;
