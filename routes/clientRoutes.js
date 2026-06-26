import express from "express";
import Client, {
  clientCities,
  clientCityZonesByCity,
} from "../models/Client.js";
import NextStep from "../models/NextStep.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

const validateClientLocation = (payload, existingClient) => {
  const city = payload.city ?? existingClient?.city;
  const cityZone = payload.cityZone ?? existingClient?.cityZone;

  if (!city || !clientCities.includes(city)) {
    return "A valid city is required.";
  }

  if (!cityZone || !clientCityZonesByCity[city]?.includes(cityZone)) {
    return "A valid city zone is required for the selected city.";
  }

  return null;
};

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
  const locationError = validateClientLocation(req.body);

  if (locationError) {
    return res.status(400).json({ message: locationError });
  }

  const client = await Client.create({
    ...req.body,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res.status(201).json(client);
});

router.put("/:id", protect, allowRoles("admin", "editor"), async (req, res) => {
  const existingClient = await Client.findById(req.params.id);

  if (!existingClient) {
    return res.status(404).json({ message: "Client not found" });
  }

  if ("city" in req.body || "cityZone" in req.body) {
    const locationError = validateClientLocation(req.body, existingClient);

    if (locationError) {
      return res.status(400).json({ message: locationError });
    }
  }

  const client = await Client.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedBy: req.user._id,
    },
    { new: true, runValidators: true },
  );

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
