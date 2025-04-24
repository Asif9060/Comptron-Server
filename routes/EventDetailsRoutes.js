import express from "express";
import multer from "multer";
import Event from "../models/DetailedEvent.js";
import moment from "moment-timezone";
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
});

router.post(
  "/create",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 6 },
  ]),
  async (req, res) => {
    try {
      console.log("Incoming request body:", req.body);
      console.log("Incoming files:", req.files);

      const { title, description, startDate, startTime, endDate, endTime } =
        req.body;

      if (
        !title ||
        !description ||
        !startDate ||
        !startTime ||
        !endDate ||
        !endTime
      ) {
        return res.status(400).json({
          message: "Title, description, start and end date/time are required.",
        });
      }

      try {
        const startDateTime = moment.tz(
          `${startDate} ${startTime}`,
          "YYYY-MM-DD HH:mm",
          "Asia/Dhaka"
        );
        const endDateTime = moment.tz(
          `${endDate} ${endTime}`,
          "YYYY-MM-DD HH:mm",
          "Asia/Dhaka"
        );

        if (!startDateTime.isValid() || !endDateTime.isValid()) {
          return res.status(400).json({ message: "Invalid date/time format" });
        }

        if (endDateTime.isSameOrBefore(startDateTime)) {
          return res
            .status(400)
            .json({ message: "End date/time must be after start date/time." });
        }

        const mainImage = req.files["mainImage"]
          ? `data:image/png;base64,${req.files["mainImage"][0].buffer.toString(
              "base64"
            )}`
          : null;

        const galleryImages = req.files["galleryImages"]
          ? req.files["galleryImages"].map(
              (file) =>
                `data:image/png;base64,${file.buffer.toString("base64")}`
            )
          : [];

        const newEvent = new Event({
          title,
          description,
          startDateTime: startDateTime.toDate(),
          endDateTime: endDateTime.toDate(),
          mainImage,
          galleryImages,
        });

        await newEvent.save();
        res.status(201).json(newEvent);
      } catch (dateError) {
        console.error("Date processing error:", dateError);
        return res.status(400).json({ message: "Error processing dates" });
      }
    } catch (error) {
      console.error("Error creating event:", error);
      res
        .status(500)
        .json({ message: "Error creating event", error: error.message });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ dateTime: 1 }); // Ascending by time
    res.status(200).json(events);
  } catch (error) {
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
      const { title, description, startDate, startTime, endDate, endTime } =
        req.body;
      const updates = {};

      if (title) updates.title = title;
      if (description) updates.description = description;

      if (startDate && startTime && endDate && endTime) {
        const updatedStart = moment
          .tz(`${startDate} ${startTime}`, "YYYY-MM-DD HH:mm", "Asia/Dhaka")
          .toDate();

        const updatedEnd = moment
          .tz(`${endDate} ${endTime}`, "YYYY-MM-DD HH:mm", "Asia/Dhaka")
          .toDate();

        if (updatedEnd <= updatedStart) {
          return res
            .status(400)
            .json({ message: "End date/time must be after start date/time." });
        }

        updates.startDateTime = updatedStart;
        updates.endDateTime = updatedEnd;
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

      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }

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
