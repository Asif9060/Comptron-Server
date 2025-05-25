import Event from '../models/DetailedEvent.js';
import mongoose from 'mongoose';

// Function to handle form field configuration
export const updateEventFormFields = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { enabled, fields } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        event.registrationForm = {
            enabled: enabled,
            fields: fields
        };

        await event.save();
        res.json({ message: "Form configuration updated successfully", event });
    } catch (error) {
        console.error('Error updating form fields:', error);
        res.status(500).json({ message: "Error updating form configuration", error: error.message });
    }
};

// Function to handle event registration
export const handleEventRegistration = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { formData } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (!event.registrationForm?.enabled) {
            return res.status(400).json({ message: "Registration is not enabled for this event" });
        }

        // Create registration schema dynamically
        const registrationSchema = new mongoose.Schema({
            eventId: { type: mongoose.Schema.Types.ObjectId, required: true },
            submittedAt: { type: Date, default: Date.now },
            formData: { type: Map, of: mongoose.Schema.Types.Mixed }
        });

        // Create or get the model (prevents multiple model creation)
        const Registration = mongoose.models.Registration || 
            mongoose.model('Registration', registrationSchema);

        // Save registration data
        const registration = new Registration({
            eventId,
            formData: new Map(Object.entries(formData))
        });

        await registration.save();
        res.status(201).json({ message: "Registration successful", registration });
    } catch (error) {
        console.error('Error handling registration:', error);
        res.status(500).json({ message: "Error processing registration", error: error.message });
    }
};
