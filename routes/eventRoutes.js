import express from "express";
import Event from "../models/Event.js";
import moment from "moment";

const router = express.Router();

router.get("/event", async (req, res) => {
  try {
    const event = await Event.findOne();
    if (!event) return res.status(404).json({ message: "No event found" });

    res.json({ eventDate: event.eventDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/event", async (req, res) => {
  try {
    console.log("Received request body:", req.body); // Debugging

    const { eventDate } = req.body;
    if (!eventDate) {
      console.error("Error: eventDate is missing from request.");
      return res.status(400).json({ error: "Event date is required" });
    }

    // Convert timestamp to formatted date
    const formattedDate = moment(eventDate).format("MMMM D, YYYY, h:mm A");
    console.log("Formatted Date:", formattedDate); // Debugging

    let event = await Event.findOne();
    if (event) {
      event.eventDate = formattedDate;
    } else {
      event = new Event({ eventDate: formattedDate });
    }

    await event.save();
    console.log("Event saved successfully:", event); // Debugging

    res.json({ message: "Event updated", eventDate: formattedDate });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
