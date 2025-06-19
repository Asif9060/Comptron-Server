import express from 'express';
import AdvisorProfile from '../models/AdvisorProfile.js';
import cloudinary from '../config/cloudinary.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// GET all advisor profiles
router.get('/', async (req, res) => {
    try {
        const profiles = await AdvisorProfile.find().sort({ customId: 1 });
        res.status(200).json(profiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single advisor profile by customId
router.get('/:customId', async (req, res) => {
    try {
        const profile = await AdvisorProfile.findOne({ customId: req.params.customId });
        if (!profile) {
            return res.status(404).json({ message: 'Advisor profile not found' });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new advisor profile
router.post('/', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'cv', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, email, phone, skill, github, linkedin, portfolio } = req.body;

        // Upload image to Cloudinary
        let imageUrl = '';
        if (req.files.image) {
            const result = await cloudinary.uploader.upload(req.files.image[0].path, {
                folder: 'advisor-profiles'
            });
            imageUrl = result.secure_url;
        }

        // Upload CV to Cloudinary if provided
        let cvUrl = '';
        if (req.files.cv) {
            const cvResult = await cloudinary.uploader.upload(req.files.cv[0].path, {
                folder: 'advisor-cvs'
            });
            cvUrl = cvResult.secure_url;
        }

        const profile = new AdvisorProfile({
            name,
            email,
            phone,
            skill: skill.split(',').map(s => s.trim()),
            image: imageUrl,
            github,
            linkedin,
            portfolio,
            cv: cvUrl
        });

        const savedProfile = await profile.save();
        res.status(201).json(savedProfile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update advisor profile
router.put('/:customId', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'cv', maxCount: 1 }
]), async (req, res) => {
    try {
        const profile = await AdvisorProfile.findOne({ customId: req.params.customId });
        if (!profile) {
            return res.status(404).json({ message: 'Advisor profile not found' });
        }

        const updates = { ...req.body };

        // Handle image upload if new image is provided
        if (req.files.image) {
            const result = await cloudinary.uploader.upload(req.files.image[0].path, {
                folder: 'advisor-profiles'
            });
            updates.image = result.secure_url;
        }

        // Handle CV upload if new CV is provided
        if (req.files.cv) {
            const cvResult = await cloudinary.uploader.upload(req.files.cv[0].path, {
                folder: 'advisor-cvs'
            });
            updates.cv = cvResult.secure_url;
        }

        const updatedProfile = await AdvisorProfile.findOneAndUpdate(
            { customId: req.params.customId },
            updates,
            { new: true }
        );

        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE advisor profile
router.delete('/:customId', async (req, res) => {
    try {
        const profile = await AdvisorProfile.findOne({ customId: req.params.customId });
        if (!profile) {
            return res.status(404).json({ message: 'Advisor profile not found' });
        }

        await AdvisorProfile.deleteOne({ customId: req.params.customId });
        res.status(200).json({ message: 'Profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
