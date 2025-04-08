import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        
        const newUser = new User({
            name,
            email,
            phone,
            password // Add hashing in production
        });

        await newUser.save();
        res.json({ message: 'Registration successful!' });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).send('Email already exists');
        } else {
            res.status(500).send(error.message);
        }
    }
});

export default router;