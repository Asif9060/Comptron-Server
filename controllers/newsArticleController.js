import NewsArticle from '../models/NewsArticle.js';

// Get all news articles
export const getAllNewsArticles = async (req, res) => {
    try {
        const newsArticles = await NewsArticle.find().sort({ publishedAt: -1 });
        res.status(200).json({
            success: true,
            count: newsArticles.length,
            data: newsArticles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Get a single news article by ID
export const getNewsArticleById = async (req, res) => {
    try {
        const newsArticle = await NewsArticle.findById(req.params.id);
        
        if (!newsArticle) {
            return res.status(404).json({
                success: false,
                error: 'News article not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: newsArticle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Create a new news article
export const createNewsArticle = async (req, res) => {
    try {
        const newsArticle = await NewsArticle.create(req.body);
        
        res.status(201).json({
            success: true,
            data: newsArticle
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            
            return res.status(400).json({
                success: false,
                error: messages
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Server Error'
            });
        }
    }
};

// Update a news article
export const updateNewsArticle = async (req, res) => {
    try {
        const newsArticle = await NewsArticle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!newsArticle) {
            return res.status(404).json({
                success: false,
                error: 'News article not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: newsArticle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Delete a news article
export const deleteNewsArticle = async (req, res) => {
    try {
        const newsArticle = await NewsArticle.findByIdAndDelete(req.params.id);
        
        if (!newsArticle) {
            return res.status(404).json({
                success: false,
                error: 'News article not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};