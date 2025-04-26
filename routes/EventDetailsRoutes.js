import express from "express";
import multer from "multer";
import Event from "../models/DetailedEvent.js";
import moment from "moment-timezone";
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create index on startDateTime for optimized sorting
Event.collection.createIndex({ startDateTime: 1 }).catch(console.error);

router.post(
  "/create",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 6 },
  ]),
  async (req, res) => {
    try {
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
        return res
          .status(400)
          .json({
            message:
              "Title, description, start date/time, and end date/time are required.",
          });
      }

      let mainImage = null;
      if (req.files["mainImage"]) {
        const file = req.files["mainImage"][0];
        mainImage = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          });
          stream.end(file.buffer);
        });
      }

      let galleryImages = [];
      if (req.files["galleryImages"]) {
        galleryImages = await Promise.all(req.files["galleryImages"].map(file =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            });
            stream.end(file.buffer);
          })
        ));
      }

      const startDateTime = moment
        .tz(`${startDate} ${startTime}`, "YYYY-MM-DD hh:mm A", "Asia/Dhaka")
        .toDate();

      const endDateTime = moment
        .tz(`${endDate} ${endTime}`, "YYYY-MM-DD hh:mm A", "Asia/Dhaka")
        .toDate();

      const newEvent = new Event({
        title,
        description,
        startDateTime,
        endDateTime,
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

// ✅ Updated GET route using allowDiskUse
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ startDateTime: 1 }); // Ascending by startDateTime

    const formattedEvents = events.map((event) => {
      const startDate = moment(event.startDateTime).format("YYYY-MM-DD");
      const startTime = moment(event.startDateTime).format("hh:mm A");
      const endDate = moment(event.endDateTime).format("YYYY-MM-DD");
      const endTime = moment(event.endDateTime).format("hh:mm A");

      return {
        ...event._doc,
        startDate,
        startTime,
        endDate,
        endTime,
      };
    });

    res.status(200).json(formattedEvents);
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

      if (startDate && startTime) {
        updates.startDateTime = moment
          .tz(`${startDate} ${startTime}`, "YYYY-MM-DD hh:mm A", "Asia/Dhaka")
          .toDate();
      }

      if (endDate && endTime) {
        updates.endDateTime = moment
          .tz(`${endDate} ${endTime}`, "YYYY-MM-DD hh:mm A", "Asia/Dhaka")
          .toDate();
      }

      if (req.files["mainImage"]) {
        const file = req.files["mainImage"][0];
        updates.mainImage = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          });
          stream.end(file.buffer);
        });
      }

      if (req.files["galleryImages"]) {
        updates.galleryImages = await Promise.all(req.files["galleryImages"].map(file =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            });
            stream.end(file.buffer);
          })
        ));
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
