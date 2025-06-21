import express from "express";
import multer from "multer";
import Event from "../models/DetailedEvent.js";
import moment from "moment-timezone";
import cloudinary from "../config/cloudinary.js";
import protectAdminRoute from '../middleware/adminAuth.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create index on startDateTime for optimized sorting
Event.collection.createIndex({ startDateTime: 1 }).catch(console.error);

router.post(
  "/create", protectAdminRoute,
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
        return res.status(400).json({
          message:
            "Title, description, start date/time, and end date/time are required.",
        });
      }

      let mainImage = null;
      if (req.files["mainImage"]) {
        const file = req.files["mainImage"][0];
        mainImage = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(file.buffer);
        });
      }

      let galleryImages = [];
      if (req.files["galleryImages"]) {
        galleryImages = await Promise.all(
          req.files["galleryImages"].map(
            (file) =>
              new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                  { resource_type: "image" },
                  (error, result) => {
                    if (error) reject(error);
                    else resolve(result.secure_url);
                  }
                );
                stream.end(file.buffer);
              })
          )
        );
      }

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

      // Parse registration form data if it exists
      let formConfig;
      if (req.body.registrationForm) {
        formConfig = JSON.parse(req.body.registrationForm);
      }

      // Parse bullet points if they exist
      let bulletPoints = [];
      if (req.body.bulletPoints) {
        bulletPoints = JSON.parse(req.body.bulletPoints);
      }

      const event = new Event({
        title,
        description,
        bulletPoints,
        mainImage,
        galleryImages,
        startDateTime,
        endDateTime,
        registrationForm: formConfig,
      });

      await event.save();
      res.status(201).json(event);
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

// Get a single event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select({
      title: 1,
      description: 1,
      bulletPoints: 1,
      mainImage: 1,
      galleryImages: 1,
      startDateTime: 1,
      endDateTime: 1,
      registrationForm: 1,
      createdAt: 1,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res
      .status(500)
      .json({ message: "Error fetching event details", error: error.message });
  }
});

router.put(
  "/:id", protectAdminRoute,
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

      // Handle bullet points updates
      if (req.body.bulletPoints) {
        updates.bulletPoints = JSON.parse(req.body.bulletPoints);
      }

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
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(file.buffer);
        });
      }

      if (req.files["galleryImages"]) {
        updates.galleryImages = await Promise.all(
          req.files["galleryImages"].map(
            (file) =>
              new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                  { resource_type: "image" },
                  (error, result) => {
                    if (error) reject(error);
                    else resolve(result.secure_url);
                  }
                );
                stream.end(file.buffer);
              })
          )
        );
      }

      // Handle registration form updates
      if (req.body.registrationForm) {
        updates.registrationForm = JSON.parse(req.body.registrationForm);
      }

      const event = await Event.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      );

      if (!event) return res.status(404).json({ message: "Event not found" });

      res.status(200).json({ message: "Event updated successfully", event });
    } catch (error) {
      res.status(500).json({ message: "Error updating event", error });
    }
  }
);

router.delete("/:id", protectAdminRoute, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event", error });
  }
});

export default router;
