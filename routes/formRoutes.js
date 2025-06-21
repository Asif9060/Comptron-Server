import express from "express";
import {
  updateEventFormFields,
  handleEventRegistration,
  getEventRegistrations,
} from "../controllers/formController.js";
import protectAdminRoute from '../middleware/adminAuth.js';

const router = express.Router();

// Route to update form fields for an event
router.put("/events/:eventId/form", protectAdminRoute, updateEventFormFields);

// Route to handle event registration submissions
router.post("/eventDetails/:eventId/register", handleEventRegistration);

// Route to get event registrations
router.get("/eventDetails/:eventId/registrations", protectAdminRoute, getEventRegistrations);

export default router;
