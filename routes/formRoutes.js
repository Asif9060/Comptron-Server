import express from "express";
import {
  updateEventFormFields,
  handleEventRegistration,
  getEventRegistrations,
} from "../controllers/formController.js";
import { checkOrigin } from '../middleware/checkOrigin.js';

const router = express.Router();

// Route to update form fields for an event
router.put("/events/:eventId/form", checkOrigin, updateEventFormFields);

// Route to handle event registration submissions
router.post("/eventDetails/:eventId/register", checkOrigin, handleEventRegistration);

// Route to get event registrations
router.get("/eventDetails/:eventId/registrations", checkOrigin, getEventRegistrations);

export default router;
