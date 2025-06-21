import express from "express";
import {
  updateEventFormFields,
  handleEventRegistration,
  getEventRegistrations,
} from "../controllers/formController.js";

const router = express.Router();

// Route to update form fields for an event
router.put("/events/:eventId/form", updateEventFormFields);

// Route to handle event registration submissions
router.post("/eventDetails/:eventId/register", handleEventRegistration);

// Route to get event registrations
router.get("/eventDetails/:eventId/registrations", getEventRegistrations);

export default router;
