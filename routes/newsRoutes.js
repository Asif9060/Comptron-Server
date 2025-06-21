import express from 'express';
import News from '../models/News.js';
import protectAdminRoute from '../middleware/adminAuth.js';

const router = express.Router();

// Get all news
router.get('/', protectAdminRoute, async (req, res) => {
    const news = await News.find();
    res.json(news);
});

// Add new news item
router.post('/', protectAdminRoute, async (req, res) => {
    const { text, link } = req.body;
    const newNews = new News({ text, link });
    await newNews.save();
    res.json(newNews);
});

// Update news item
router.put('/:id', protectAdminRoute, async (req, res) => {
    const { text, link } = req.body;
    const updatedNews = await News.findByIdAndUpdate(req.params.id, { text, link }, { new: true });
    res.json(updatedNews);
});

// Delete news item
router.delete('/:id', protectAdminRoute, async (req, res) => {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
});

export default router;
