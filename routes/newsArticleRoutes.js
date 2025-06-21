import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import {
    getAllNewsArticles,
    getNewsArticleById,
    createNewsArticle,
    updateNewsArticle,
    deleteNewsArticle
} from '../controllers/newsArticleController.js';
import protectAdminRoute from '../middleware/adminAuth.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload image to cloudinary
router.post('/upload', protectAdminRoute, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload an image'
            });
        }

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'image' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        res.status(200).json({
            success: true,
            data: {
                url: result.secure_url,
                public_id: result.public_id
            }
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            success: false,
            error: 'Error uploading image'
        });
    }
});

// Get all news articles and create a new one
router.route('/')
    .get(getAllNewsArticles)
    .post(protectAdminRoute, createNewsArticle);

// Get, update, and delete a specific news article
router.route('/:id')
    .get(getNewsArticleById)
    .put(protectAdminRoute, updateNewsArticle)
    .delete(protectAdminRoute, deleteNewsArticle);

export default router;