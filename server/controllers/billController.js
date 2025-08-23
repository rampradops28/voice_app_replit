import { storage } from "../storage.js";

export const getBill = async (req, res) => {
  try {
    const { userId, sessionId } = req.params;
    const bill = await storage.getBill(userId, sessionId);
    res.json(bill);
  } catch (error) {
    console.error("Error fetching bill:", error);
    res.status(500).json({ message: "Failed to fetch bill" });
  }
};

export const upsertBill = async (req, res) => {
  try {
    const bill = await storage.createOrUpdateBill(req.body);
    res.json(bill);
  } catch (error) {
    console.error("Error creating/updating bill:", error);
    res.status(500).json({ message: "Failed to create/update bill" });
  }
};
