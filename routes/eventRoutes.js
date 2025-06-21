import express from "express";
import Event from "../models/Event.js";
import moment from "moment";
import protectAdminRoute from '../middleware/adminAuth.js';

const router = express.Router();

router.get("/event", protectAdminRoute, async (req, res) => {
  try {
    const event = await Event.findOne();
    if (!event) return res.status(404).json({ message: "No event found" });

    res.json({
      eventDate: event.eventDate,
      eventName: event.name || "Unnamed Event",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/event", protectAdminRoute, async (req, res) => {
  try {
    console.log("Received request body:", req.body);

    const { eventDate, eventName } = req.body;

    if (!eventDate || !eventName) {
      return res.status(400).json({ error: "Event date and name are required" });
    }

    // Convert timestamp to Date object
    const formattedDate = moment(eventDate).toDate();
    console.log("Parsed Event Date:", formattedDate);

    let event = await Event.findOne(); // You may want to find by ID or criteria

    if (event) {
      event.eventDate = formattedDate;
      event.name = eventName;
    } else {
      event = new Event({ eventDate: formattedDate, name: eventName });
    }

    await event.save();
    console.log("Event saved successfully:", event);

    res.json({ message: "Event updated", event });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
