import express from 'express';
import { updateEventFormFields, handleEventRegistration } from '../controllers/formController.js';

const router = express.Router();

// Route to update form fields for an event
router.put('/events/:eventId/form', updateEventFormFields);

// Route to handle event registration submissions
router.post('/eventDetails/:eventId/register', handleEventRegistration);

export default router;
