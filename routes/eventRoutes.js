import express from "express";
import Event from "../models/Event.js";
import moment from "moment";

const router = express.Router();

// GET Event Date
router.get("/event", async (req, res) => {
  try {
    const event = await Event.findOne();
    if (!event) return res.status(404).json({ message: "No event found" });

    res.json({ eventDate: event.eventDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Event Date
router.post("/event", async (req, res) => {
  try {
    const { eventDate } = req.body;

    const formattedDate = moment(eventDate).format("MMMM D, YYYY, h:mm A");

    let event = await Event.findOne();

    if (event) {
      event.eventDate = formattedDate;
    } else {
      event = new Event({  eventDate: formattedDate  });
    }

    await event.save();
    res.json({ message: "Event updated", eventDate: formattedDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
