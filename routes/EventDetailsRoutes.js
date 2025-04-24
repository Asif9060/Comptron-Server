import express from "express";
import multer from "multer";
import Event from "../models/DetailedEvent.js";
import moment from "moment-timezone";
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/create",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 6 },
  ]),
  async (req, res) => {
    try {
      const { title, description, date, time, durationDays } = req.body;

      if (!title || !description || !date) {
        return res
          .status(400)
          .json({ message: "Title, description, and date are required." });
      }

      const parsedDuration = parseInt(durationDays, 10) || 1;

      const mainImage = req.files["mainImage"]
        ? `data:image/png;base64,${req.files["mainImage"][0].buffer.toString("base64")}`
        : null;

      const galleryImages = req.files["galleryImages"]
        ? req.files["galleryImages"].map(
            (file) => `data:image/png;base64,${file.buffer.toString("base64")}`
          )
        : [];

      const dateTime = moment
        .tz(`${date} ${time}`, "YYYY-MM-DD hh:mm A", "Asia/Dhaka")
        .toDate();

      const endTime = new Date(
        dateTime.getTime() + parsedDuration * 24 * 60 * 60 * 1000
      );

      const newEvent = new Event({
        title,
        description,
        date,
        time,
        durationDays: parsedDuration,
        dateTime,
        endTime,
        mainImage,
        galleryImages,
      });

      await newEvent.save();
      res.status(201).json(newEvent);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Error creating event", error });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const events = await Event.aggregate([
      { $sort: { dateTime: 1 } }
    ]).option({ allowDiskUse: true });

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events", error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error fetching event", error });
  }
});

router.put(
  "/:id",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 6 },
  ]),
  async (req, res) => {
    try {
      const { title, description, date, time, durationDays } = req.body;
      const updates = {};

      if (title) updates.title = title;
      if (description) updates.description = description;

      const parsedDuration = parseInt(durationDays, 10) || 1;
      updates.durationDays = parsedDuration; // ✅ Save the updated duration

      if (date && time) {
        const updatedStart = moment
          .tz(`${date} ${time}`, "YYYY-MM-DD hh:mm A", "Asia/Dhaka")
          .toDate();
        updates.dateTime = updatedStart;

        updates.endTime = new Date(
          updatedStart.getTime() + parsedDuration * 24 * 60 * 60 * 1000
        );
      }

      if (req.files["mainImage"]) {
        updates.mainImage = `data:image/png;base64,${req.files[
          "mainImage"
        ][0].buffer.toString("base64")}`;
      }

      if (req.files["galleryImages"]) {
        updates.galleryImages = req.files["galleryImages"].map(
          (file) => `data:image/png;base64,${file.buffer.toString("base64")}`
        );
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      );

      if (!updatedEvent)
        return res.status(404).json({ message: "Event not found" });

      res
        .status(200)
        .json({ message: "Event updated successfully", updatedEvent });
    } catch (error) {
      res.status(500).json({ message: "Error updating event", error });
    }
  }
);


router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ message: "Event deleted successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Error deleting event", error });
  }
});

export default router;
