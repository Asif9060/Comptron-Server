import NewsArticle from '../models/NewsArticle.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import fs from 'fs/promises';

// Create a new news article
export const createArticle = async (req, res) => {
    try {
        const { title, summary, body, tags } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        // Upload image to Cloudinary
        const imageResult = await uploadToCloudinary(req.file.path);
        await fs.unlink(req.file.path); // Clean up uploaded file

        const article = new NewsArticle({
            title,
            summary,
            body,
            image: {
                url: imageResult.secure_url,
                alt: title
            },
            author: req.user._id,
            tags: tags ? JSON.parse(tags) : []
        });

        await article.save();
        res.status(201).json(article);
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all articles with pagination and filtering
export const getArticles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const tag = req.query.tag;
        const search = req.query.search;

        const query = { status: 'published' };
        
        if (tag) {
            query.tags = tag;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { summary: { $regex: search, $options: 'i' } }
            ];
        }

        const articles = await NewsArticle.find(query)
            .populate('author', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const total = await NewsArticle.countDocuments(query);

        res.json({
            articles,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalArticles: total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single article by slug or ID
export const getArticle = async (req, res) => {
    try {
        const query = mongoose.Types.ObjectId.isValid(req.params.id) 
            ? { _id: req.params.id }
            : { slug: req.params.id };

        const article = await NewsArticle.findOneAndUpdate(
            query,
            { $inc: { viewCount: 1 } },
            { new: true }
        ).populate('author', 'name');

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Get related articles based on tags
        const relatedArticles = await NewsArticle.find({
            _id: { $ne: article._id },
            tags: { $in: article.tags },
            status: 'published'
        })
        .select('title summary image slug createdAt')
        .limit(3)
        .lean();

        res.json({ article, relatedArticles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update article
export const updateArticle = async (req, res) => {
    try {
        const { title, summary, body, tags, status } = req.body;
        const updates = { title, summary, body, status };

        if (tags) {
            updates.tags = JSON.parse(tags);
        }

        if (req.file) {
            const imageResult = await uploadToCloudinary(req.file.path);
            await fs.unlink(req.file.path);
            updates.image = {
                url: imageResult.secure_url,
                alt: title
            };
        }

        const article = await NewsArticle.findOneAndUpdate(
            { _id: req.params.id, author: req.user._id },
            updates,
            { new: true, runValidators: true }
        );

        if (!article) {
            return res.status(404).json({ 
                message: 'Article not found or you are not authorized to edit it' 
            });
        }

        res.json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete article
export const deleteArticle = async (req, res) => {
    try {
        const article = await NewsArticle.findOneAndDelete({
            _id: req.params.id,
            author: req.user._id
        });

        if (!article) {
            return res.status(404).json({ 
                message: 'Article not found or you are not authorized to delete it' 
            });
        }

        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};